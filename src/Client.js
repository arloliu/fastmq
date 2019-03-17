'use strict';
const promiseImpl = require('bluebird');
global.Promise = promiseImpl;

const net = require('net');
const EventEmitter = require('eventemitter3');
const Message = require('./Message.js');
const Response = require('./Response.js');
const MessageReceiver = require('./MessageReceiver.js');
const getSocketPath = require('./common.js').getSocketPath;
const util = require('util');
const debug = util.debuglog('fastmq');

class Channel {
    constructor(channelName, serverChannel, clientSocket) {
        // public properties
        this.channel = channelName;
        this.serverChannel = serverChannel;

        // private properties
        this._socket = clientSocket;
        this._requestEvent = new EventEmitter();
        this._responseEvent = new EventEmitter();
        this._subEvent = new EventEmitter();
        this._pullEvent = new EventEmitter();
        this._errorEvent = new EventEmitter();

        this._messageHandler = this._messageHandler.bind(this);
        this._msgReceiver = new MessageReceiver(this._messageHandler);
        this._msgReceiver.on('error', (err) => {
            debug('Message receiver got error:', err.stack);
            this._errorEvent.emit('error', err);
        });

        this._socket.on('data', (chunk) => {
            this._msgReceiver.recv(chunk, this._socket);
        });
        this._socket.on('error', (err) => {
            this._errorEvent.emit('error', err);
        });
    }

    _messageHandler(msg, rawBuf, socket) {
        if (msg.isRequest()) {
            const res = new Response(msg, socket);
            process.nextTick(() => {
                this._requestEvent.emit(msg.header.topic, msg, res);
            });
        } else if (msg.isResponse()) {
            process.nextTick(() => {
                this._responseEvent.emit(msg.getEventName(), msg);
            });
        } else if (msg.isPull()) {
            // debug('Got pull message\n# Header:\n', msg.header, '\n# Payload:', msg.payload);
            process.nextTick(() => {
                this._pullEvent.emit(msg.header.topic, msg);
            });
        } else if (msg.isSubscribe()) {
            // debug('Got subscribe message\n# Header:\n', msg.header, '\n# Payload:', msg.payload);
            process.nextTick(() => {
                this._subEvent.emit(msg.header.topic, msg);
            });
        }
    }

    onError(listener) {
        if (listener === undefined || typeof listener !== 'function') {
            throw new TypeError('Listener must be a function.');
        }

        this._errorEvent.on('error', listener);
    }

    disconnect() {
        if (this._socket) {
            this._socket.destroy();
            this._socket.unref();
        }
    }

    request(target, topic, data = {}, contentType = 'json') {
        return new Promise((resolve, reject) => {
            try {
                const msg = Message.create('req');
                msg.setTopic(topic);
                msg.setSource(this.channel);
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
        return this.request(this.serverChannel, topic, data, contentType);
    }

    response(topic, listener) {
        this._requestEvent.on(topic, (reqMsg, res) => {
            listener(reqMsg, res);
        });
        // register this request listener to server
        this._serverRequest('addResponseListener', { topic: topic }, 'json').then((resMsg) => {
            debug(`addResponseListener topic: ${topic}, result: ${resMsg.payload.result}`);
            if (resMsg.isError('REGISTER_FAIL')) {
                this._requestEvent.removeAllListeners(topic);
                this._errorEvent.emit('error', new Error(`Register pull listener for topic: ${topic} fail`));
            }
        });
        return this;
    }

    push(target, topic, items, contentType = 'json') {
        if (arguments.length < 3) {
            return Promise.reject(new Error('Need at least three arguments.'));
        }

        return new Promise((resolve, reject) => {
            const msg = Message.create('push');
            msg.setTopic(topic);
            msg.setTarget(target);
            msg.setPayload(items, contentType);
            this._socket.write(msg.getBuffer(), 'utf8', () => {
                resolve();
            });
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
                this._errorEvent.emit('error', new Error(`Register pull listener for topic: ${topic} fail`));
            }
        });
        return this;
    }

    publish(target, topic, data, contentType = 'json') {
        if (arguments.length < 3) {
            return Promise.reject(new Error('Need at least three arguments.'));
        }

        return new Promise((resolve, reject) => {
            const msg = Message.create('pub');
            msg.setTopic(topic);
            msg.setTarget(target);
            msg.setPayload(data, contentType);
            this._socket.write(msg.getBuffer(), 'utf8', () => {
                resolve();
            });
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

        return this._serverRequest('addSubscribeListener', regPayload, 'json').then((resMsg) => {
            if (resMsg.isError('REGISTER_FAIL')) {
                this._subEvent.removeAllListeners(topic);
                this._errorEvent.emit('error', new Error(`Register subscribe listener for topic: ${topic} fail`));
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

function _registerChannel(channel, serverChannel) {
    return channel._serverRequest('register').then((msg) => {
        if (msg.header.error) {
            const err = new Error('register channel fail.');
            return Promise.reject(err);
        } else {
            return Promise.resolve(channel);
        }
    });
}
// connect(channelName, serverChannel[, connectListener])
// connect(channelName, serverChannel, port[, host][, connectListener])
exports.connect = function(...args) {
    if (arguments.length < 2) {
        throw new Error('Invalid create argument, it needs at least two argument.');
    }

    // const args = new Array(arguments.length);
    // for (let i = 0; i < arguments.length; i++) {
    //     args[i] = arguments[i];
    // }

    if (args[0] === null || typeof args[0] !== 'string') {
        throw new TypeError('Invalid client channel name, channel name must be a string type.');
    }
    if (args[1] === null || typeof args[1] !== 'string') {
        throw new TypeError('Invalid server channel name, channel name must be a string type.');
    }

    const channelName = args[0].trim();
    const serverChannel = args[1].trim();
    const connectListener = args[args.length - 1];
    const options = {};

    if (arguments.length > 2) {
        if (typeof args[2] === 'number' && toNumber(args[2]) !== false) {
            // create(name, port[, host])
            options.port = toNumber(args[2]);
            if (arguments.length > 3 && typeof args[3] === 'string') {
                options.host = args[3];
            }

            if (options.port !== undefined && options.host === undefined) {
                options.host = 'localhost';
            }
        } else {
            options.path = getSocketPath(serverChannel);
        }
    } else {
        options.path = getSocketPath(serverChannel);
    }

    // use node.js callback pattern
    if (typeof connectListener === 'function') {
        const socket = net.connect(options);
        const channel = new Channel(channelName, serverChannel, socket);
        socket.on('connect', () => {
            _registerChannel(channel)
                .then(() => {
                    connectListener(null, channel);
                })
                .catch((err) => {
                    connectListener(err, channel);
                });
        });
        return channel;
    } else {
        // use Promise pattern
        return new Promise((resolve, reject) => {
            const socket = net.connect(options, () => {
                const channel = new Channel(channelName, serverChannel, socket);
                return _registerChannel(channel)
                    .then(resolve)
                    .catch(reject);
            });
        });
    }
};
