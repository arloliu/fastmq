'use strict';
const semver = require('semver');
const majorVer = semver.major(process.version);
if (majorVer < 12) {
    global.Promise = require('bluebird');
}

const _ = require('lodash');
const net = require('net');
const EventEmitter = require('eventemitter3');
const Message = require('./Message.js');
const Response = require('./Response.js');
const MessageReceiver = require('./MessageReceiver.js');
const util = require('util');
const {getSocketPath} = require('./common.js');
const debug = util.debuglog('fastmq');

function isThenable(object) {
    return (object && typeof object.then === 'function') ? true : false;
}

function wrapThenable(thenable, response) {
    thenable.then((payload) => {
        if (payload !== undefined || response.sent === false) {
            response.send(payload);
        }
    }, (err) => {
        debug('Response got error:', err);
    });
}

class Channel {
    constructor(channelName, options) {
        // public properties
        this.name = channelName;

        // private properties
        this._options = _.cloneDeep(options);
        this._socket = null;
        this._connected = false;
        this._needReconnect = false;
        this._requestEvent = new EventEmitter();
        this._responseEvent = new EventEmitter();
        this._subEvent = new EventEmitter();
        this._pullEvent = new EventEmitter();
        this._monitorEvent = new EventEmitter();
        this._internalEvent = new EventEmitter();

        this._eventStore = {
            'sub': [],
            'pull': [],
        };

        this._watchChannelStore = new Map();

        this._messageHandler = this._messageHandler.bind(this);
        this._msgReceiver = new MessageReceiver(this._messageHandler);
        this._msgReceiver.on('error', (err) => {
            debug('Message receiver got error:', err.stack);
            this._internalEvent.emit('error', err);
        });
    }

    _messageHandler(msg, rawBuf, socket) {
        if (msg.isRequest()) {
            const res = new Response(msg, socket);
            setImmediate(() => {
                this._requestEvent.emit(msg.header.topic, msg, res);
            });
        } else if (msg.isResponse()) {
            setImmediate(() => {
                this._responseEvent.emit(msg.getEventName(), msg);
            });
        } else if (msg.isPull()) {
            // debug('Got pull message\n# Header:\n', msg.header, '\n# Payload:', msg.payload);
            setImmediate(() => {
                this._pullEvent.emit(msg.header.topic, msg);
            });
        } else if (msg.isSubscribe()) {
            // debug('Got subscribe message\n# Header:\n', msg.header, '\n# Payload:', msg.payload);
            setImmediate(() => {
                this._subEvent.emit(msg.header.topic, msg);
            });
        } else if (msg.isMonitor()) {
            debug('Got monitor message\n# Header:\n', msg.header, '\n# Payload:', msg.payload);
            setImmediate(() => {
                this._monitorEvent.emit(msg.payload.channelPattern, msg);
            });
        }
    }

    onError(listener) {
        if (!_.isFunction(listener)) {
            throw new TypeError('Listener must be a function.');
        }

        this._internalEvent.on('error', listener);
    }

    onReconnect(listener) {
        if (!_.isFunction(listener)) {
            throw new TypeError('Listener must be a function.');
        }

        this._internalEvent.on('reconnect', listener);
    }

    connect(isReconnect) {
        const socketOptions = {
            path: this._options.path,
            port: this._options.port,
            host: this._options.host,
        };

        const cbStyle = _.isFunction(this._options.connectListener);

        return new Promise((resolve, reject) => {
            this._socket = net.connect(socketOptions);

            this._socket.on('data', (chunk) => {
                this._msgReceiver.recv(chunk, this._socket);
            });

            this._socket.on('error', (err) => {
                this._needReconnect = true;
                this._internalEvent.emit('error', err);
                if (!this._connected) {
                    reject(err);
                }
            });

            this._socket.on('connect', () => {
                this._registerChannel().then(() => {
                    this._connected = true;
                    this._needReconnect = true;
                    debug('client connected, _connected:', this._connected);

                    if (isReconnect) {
                        do {
                            const sub = this._eventStore.sub.pop();
                            if (!sub) {
                                break;
                            }
                            this.subscribe(sub.topic, sub.listener);
                        } while (true);

                        do {
                            const pull = this._eventStore.pull.pop();
                            if (!pull) {
                                break;
                            }
                            this.pull(pull.topic, pull.options, pull.listener);
                        } while (true);
                    }

                    if (cbStyle) {
                        this._options.connectListener(null, this);
                    } else {
                        resolve(this);
                    }
                })
                .catch((err) => {
                    if (cbStyle) {
                        this._options.connectListener(err, this);
                    } else {
                        debug('connect reject:', err);
                        reject(err);
                    }
                });
            });

            this._socket.on('close', (err) => {
                this._responseEvent.removeAllListeners();
                this._subEvent.removeAllListeners();
                this._pullEvent.removeAllListeners();
                this._connected = false;

                this._socket.destroy();
                this._socket.unref();
                this._socket = null;

                if (!this._options.reconnect || this._connected || !this._needReconnect) {
                    return;
                }

                this.reconnect();
            });
        });
    }

    reconnect() {
        setTimeout(() => {
            debug('reconnect, interval:', this._options.reconnectInterval);
            this.connect(true).then(() => {
                this._internalEvent.emit('reconnect');
            }, (err) => {
                debug('reconnect reject:', err);
            });
        }, this._options.reconnectInterval);
    }

    /* eslint-disable-next-line consistent-return */
    disconnect(graceful) {
        this._needReconnect = false;
        if (graceful) {
            return new Promise((resolve, reject) => {
                let isClose = false;
                if (!this._socket) {
                    resolve();
                    return;
                }
                this._socket.once('end', () => {
                    isClose = true;
                    debug(`Channel ${this.name} disconnected`);
                    resolve();
                    return;
                });
                setTimeout(() => {
                    if (!isClose) {
                        this._socket.destroy();
                        this._socket.unref();
                        debug(`Channel ${this.name} disconnected forcelly`);
                        resolve();
                    }
                }, 1000);
                this._socket.end();
            });
        } else {
            if (this._socket) {
                this._socket.destroy();
                this._socket.unref();
            }
        }
    }

    request(target, topic, data = {}, contentType = 'json') {
        return new Promise((resolve, reject) => {
            try {
                const msg = Message.create('req');
                msg.setTopic(topic);
                msg.setSource(this.name);
                msg.setTarget(target);
                msg.setContentType(contentType);
                msg.setPayload(data);
                const msgBuf = msg.getBuffer();
                this._socket.write(msgBuf);

                // get response data
                this._responseEvent.once(msg.getEventName(), (resMsg) => {
                    resolve(resMsg);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    _serverRequest(topic, data = {}, contentType = 'json') {
        return new Promise((resolve, reject) => {
            try {
                const msg = Message.create('sreq');
                msg.setTopic(topic);
                msg.setSource(this.name);
                msg.setTarget('');
                msg.setContentType(contentType);
                msg.setPayload(data);
                const msgBuf = msg.getBuffer();
                this._socket.write(msgBuf);

                // get response data
                this._responseEvent.once(msg.getEventName(), (resMsg) => {
                    resolve(resMsg);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    _registerChannel() {
        return this._serverRequest('register').then((msg) => {
            if (msg.header.error) {
                const err = new Error('register channel fail. errCode:' + msg.header.error);
                throw err;
            } else {
                if (_.isString(msg.payload.channelName)) {
                    this.name = msg.payload.channelName;
                }
            }
        });
    }

    getChannels(name, type) {
        if (!_.isString(name)) {
            return Promise.reject(new Error('get channel fail, channel name must be string type'));
        }
        const parameters = {
            channelName: name,
            type: type ? type : 'glob',
        };

        return this._serverRequest('getChannels', parameters).then((msg) => {
            if (msg.header.error) {
                const err = new Error('get channel fail. errCode:' + msg.header.error);
                throw err;
            } else {
                if (!_.isArray(msg.payload.channels)) {
                    throw new Error('channel list should be array type');
                }
                return msg.payload.channels;
            }
        });
    }

    watchChannels(name, callback) {
        if (!_.isString(name)) {
            return Promise.reject(new Error('get channel fail, channel name must be string type'));
        }
        return this._serverRequest('watchChannels', {channelName: name}).then((msg) => {
            if (msg.header.error) {
                const err = new Error('get channel fail. errCode:' + msg.header.error);
                throw err;
            } else {
                if (!_.isString(msg.payload.channelPattern)) {
                    throw new Error('channelPattern should be string type');
                }
                if (!_.isArray(msg.payload.channelNames)) {
                    throw new Error('channelNames should be array type');
                }

                const channelPattern = msg.payload.channelPattern;

                this._watchChannelStore.set(channelPattern, msg.payload.channelNames);

                this._monitorEvent.on(channelPattern, (monMsg) => {
                    const payload = monMsg.payload;
                    const channels = this._watchChannelStore.get(channelPattern);
                    if (payload.action === 'add') {
                        channels.push(payload.channel);
                    } else if (payload.action === 'remove') {
                        _.pull(channels, payload.channel);
                    }

                    callback(payload.action, payload.channel, channels);
                });

                return {
                    channelPattern: channelPattern,
                    channels: msg.payload.channelNames,
                };
            }
        });
    }

    response(topic, listener) {
        this._requestEvent.on(topic, (reqMsg, res) => {
            const result = listener(reqMsg, res);
            if (isThenable(result)) {
                wrapThenable(result, res);
            }
        });
        // register this request listener to server
        this._serverRequest('addResponseListener', { topic: topic }, 'json').then((resMsg) => {
            debug(`addResponseListener topic: ${topic}, result: ${resMsg.payload.result}`);
            if (resMsg.isError('REGISTER_FAIL')) {
                this._requestEvent.removeAllListeners(topic);
                this._internalEvent.emit('error', new Error(`Register response listener for topic: ${topic} fail`));
            }
        });
        return this;
    }

    push(target, topic, items, contentType = 'json') {
        if (arguments.length < 3) {
            return Promise.reject(new Error('Need at least three arguments.'));
        }

        return new Promise((resolve, reject) => {
            try {
                const msg = Message.create('push');
                msg.setTopic(topic);
                msg.setSource(this.name);
                msg.setTarget(target);
                msg.setPayload(items, contentType);
                this._socket.write(msg.getBuffer(), 'utf8', () => {
                    resolve();
                });
            } catch (err) {
                reject(err);
            };
        });
    }

    pull(topicArg, optionsArg, listenerArg) {
        if (arguments.length < 2) {
            return Promise.reject(new Error('Need at least two arguments.'));
        }

        const topic = topicArg;
        const options = arguments.length === 2 ? { prefetch: 1 } : optionsArg;
        const listener = arguments.length === 2 ? optionsArg : listenerArg;

        const regPayload = { topic: topic, options: options };

        this._pullEvent.on(topic, (msg) => {
            Promise.resolve(listener(msg)).then(() => {
                this._sendAck(msg.header.id, topic);
            });
        });

        this._serverRequest('addPullListener', regPayload, 'json').then((resMsg) => {
            if (resMsg.isError('REGISTER_FAIL')) {
                this._pullEvent.removeAllListeners(topic);
                this._internalEvent.emit('error', new Error(`Register pull listener for topic: ${topic} fail`));
            } else {
                this._eventStore.pull.push({
                    topic: topic,
                    options: options,
                    listener: listener,
                });
            }
        });
        return this;
    }

    publish(target, topic, data, contentType = 'json') {
        if (!this._connected) {
            this._internalEvent.emit('error', new Error(`Publish ${topic} fail, under disconnect state, ${this._connected}`));
            return Promise.resolve();
        }

        if (arguments.length < 3) {
            return Promise.reject(new Error('Need at least three arguments.'));
        }

        return new Promise((resolve, reject) => {
            try {
                const msg = Message.create('pub');
                msg.setTopic(topic);
                msg.setSource(this.name);
                msg.setTarget(target);
                msg.setPayload(data, contentType);

                this._socket.write(msg.getBuffer(), 'utf8', () => {
                    resolve();
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    subscribe(topic, listener) {
        if (arguments.length < 2) {
            return Promise.reject(new Error('Need at least two arguments.'));
        }

        const regPayload = { topic: topic };

        this._subEvent.on(topic, (msg) => {
            listener(msg);
        });

        this._serverRequest('addSubscribeListener', regPayload, 'json').then((resMsg) => {
            if (resMsg.isError('REGISTER_FAIL')) {
                this._subEvent.removeAllListeners(topic);
                this._internalEvent.emit('error', new Error(`Register subscribe listener for topic: ${topic} fail`));
            } else {
                this._eventStore.sub.push({
                    topic: topic,
                    listener: listener,
                });
            }
        });
        return this;
    }

    _sendAck(id, topic) {
        const msg = Message.create('ack', id);
        msg.setTopic(topic);
        // debug('Send Ack. header:', msg.header);
        this._socket.write(msg.getBuffer());
    }
}

// connect(channelName, serverPath, [connectListener])
// connect(channelName, port[, host][, connectListener])
// connect(channelName, options[, connectListener])
// options = {
//     host: '127.0.0.1',
//     port: 5555,
//     reconnect: true,
//     reconnectInterval: 1000
// }

exports.connect = function(...args) {
    if (args.length < 2) {
        throw new Error('Invalid create argument, it needs at least two argument.');
    }

    if (!_.isString(args[0])) {
        throw new TypeError('Invalid client channel name, channel name must be a string type.');
    }

    // set channel name to anonymous or specific one
    const channelName = _.isNil(args[0]) ? '' : args[0].trim();
    const connectListener = args[args.length - 1];
    let options = {};
    const defaultOptions = {
        reconnect: true,
        reconnectInterval: 1000,
    };
    // process options, port or serverPath
    if (_.isPlainObject(args[1])) {
        const opts = _.cloneDeep(args[1]);
        if (_.isString(opts.path)) {
            opts.path = getSocketPath(opts.path);
        }
        options = _.merge(defaultOptions, opts);
    } else if (_.isString(args[1])) {
        options.path = getSocketPath(args[1]);
        options = _.merge(defaultOptions, options);
    } else if (_.isNumber(args[1])) {
        options.port = args[1];
        options = _.merge(defaultOptions, options);
    }

    if (args.length > 2 && _.isString(args[2])) {
        options.host = args[2];
    }
    debug('options:', options);

    options.connectListener = connectListener;

    const channel = new Channel(channelName, options);
    return channel.connect();
};
