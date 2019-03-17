'use strict';
const promiseImpl = require('bluebird');
global.Promise = promiseImpl;

const net = require('net');
const fs = require('fs');
const EventEmitter = require('eventemitter3');
const QueueManager = require('./QueueManager.js');
const Message = require('./Message.js');
const Response = require('./Response.js');
const MessageReceiver = require('./MessageReceiver.js');
const ChannelManager = require('./ChannelManager.js');
const ErrorCode = require('./ErrorCode.js');
const common = require('./common.js');
const getSocketPath = common.getSocketPath;
const toNumber = common.toNumber;
const util = require('util');
const debug = util.debuglog('fastmq');

class Server {
    constructor(options) {
        // public properties
        this.channel = options.name;

        // private properties
        if (options.port === undefined) {
            this._serverOptions = { path: getSocketPath(options.name), exclusive: false };
        } else {
            this._serverOptions = {
                port: options.port,
                host: options.host,
                exclusive: false,
            };
        }

        this._server = null;
        this._sockets = [];

        this._channels = new ChannelManager();
        this._queueManager = new QueueManager();

        // bind message handler
        this._messageHandler = this._messageHandler.bind(this);
        // create message receiver with message handler
        this._msgReceiver = new MessageReceiver(this._messageHandler);

        this._requestHandlers = {};

        // event emitters
        this._requestEvent = new EventEmitter();
        this._responseEvent = new EventEmitter();

        this._handleConnection = this._handleConnection.bind(this);
        this._handleServerError = this._handleServerError.bind(this);

        // register server channel first
        this._channels.register(this.channel, null);
    }

    _messageHandler(msg, rawBuf, socket) {
        const header = msg.header;
        if (msg.isRequest()) {
            // Request message
            // forward to other client channel
            if (header.target !== this.channel) {
                this._forwardRequestMessage(msg, rawBuf, socket);
            } else {
                // handle this request message
                // process internal requests first, then forward to external
                // request handlers if request topic doesn't handled by
                // internal request handler
                if (!this._processInternalRequest(msg, socket)) {
                    const res = new Response(msg, socket);
                    const targetChannel = this._channels.findResponseTopic(this.channel, msg.header.topic);
                    if (!targetChannel) {
                        res.setError(ErrorCode.TOPIC_NONEXIST);
                        res.send('', 'json');
                    } else {
                        process.nextTick(() => {
                            this._requestEvent.emit(header.topic, msg, res);
                        });
                    }
                }
            }
        } else if (msg.isResponse()) {
            // Response message
            if (header.target !== this.channel) {
                this._forwardResponseMessage(msg, rawBuf);
            } else {
                process.nextTick(() => {
                    this._responseEvent.emit(msg.getEventName(), msg);
                });
            }
        } else if (msg.isPush()) {
            // Push message
            this._queueManager.processPushTasks(header.target, header.topic, msg.items, header.contentType);
        } else if (msg.isPublish()) {
            // Publish message
            this._queueManager.processPublishTask(header.target, header.topic, msg.payloadBuf, header.contentType);
        } else if (msg.isAck()) {
            // Acknowledge message
            this._queueManager.handleAck(msg);
        }
    }

    _prepareListeners() {
        this._server.on('listening', () => {});

        this._server.on('connection', this._handleConnection);
        this._server.on('error', this._handleServerError);

        this._msgReceiver.on('error', (err) => {
            debug('Message Receiver error:', err.stack);
        });
        // this._msgReceiver.on('message', this._messageHandler);
    }

    _setupRequestHandlers() {
        // setup internal request handlers
        this._requestHandlers.register = (msg, res) => {
            const srcChannel = msg.header.source;
            const socket = res.socket;
            if (this._channels.has(srcChannel)) {
                debug(`Channel '${srcChannel}' already exist.`);
                res.setError(ErrorCode.REGISTER_FAIL);
            } else {
                this._channels.register(srcChannel, socket);
                debug(`Register channel '${srcChannel}'`);
            }
            res.send('', 'json');
        };

        this._requestHandlers.addResponseListener = (msg, res) => {
            const name = msg.header.source;
            const channel = this._channels.addResponse(name, msg.payload.topic);
            if (!channel) {
                res.setError(ErrorCode.REGISTER_FAIL);
            }
            res.send({ result: channel ? true : false }, 'json');
        };

        this._requestHandlers.addPullListener = (msg, res) => {
            const payload = msg.payload;
            const name = msg.header.source;
            const channel = this._channels.addPull(name, payload.topic, payload.options);
            if (!channel) {
                res.setError(ErrorCode.REGISTER_FAIL);
            }

            const queue = this._queueManager.get('pull', payload.topic);
            queue.addChannel(channel);

            res.send({ result: channel ? true : false }, 'json');
        };

        this._requestHandlers.addSubscribeListener = (msg, res) => {
            const payload = msg.payload;
            const name = msg.header.source;
            const channel = this._channels.addSubscribe(name, payload.topic, payload.options);
            if (!channel) {
                res.setError(ErrorCode.REGISTER_FAIL);
            }

            const queue = this._queueManager.get('sub', payload.topic);
            queue.addChannel(channel);

            res.send({ result: channel ? true : false }, 'json');
        };
    }

    start() {
        if (!this._server) {
            this._server = net.createServer();
            this._prepareListeners();
            this._setupRequestHandlers();
        }
        return new Promise((resolve, reject) => {
            this._server.listen(this._serverOptions, () => {
                resolve(this);
            });
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            this._shutdown();
            this._server.close(() => {
                resolve(this);
            });
        });
    }

    // Send request to client channel
    request(target, topic, data = {}, contentType = 'json') {
        return new Promise((resolve, reject) => {
            if (!this._channels.contains(target)) {
                reject(new Error(`Target channel[${target}] doesn't exist.`));
                return;
            }
            try {
                const msg = Message.create('req');
                msg.setTopic(topic);
                msg.setSource(this.channel);
                msg.setTarget(target);
                msg.setContentType(contentType);

                msg.setPayload(data);
                const msgBuf = msg.getBuffer();
                this._client.write(msgBuf);

                // get response data
                this._responseEvent.once(msg.getEventName(), (resMsg) => {
                    resolve(resMsg);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    response(topic, listener) {
        this._channels.addResponse(this.channel, topic);
        this._requestEvent.on(topic, (msg, res) => {
            listener(msg, res);
        });
        return this;
    }

    _forwardRequestMessage(reqMsg, rawReqBuf, sourceSocket) {
        const targetChannel = this._channels.findResponseTopic(reqMsg.header.target, reqMsg.header.topic);
        if (!targetChannel) {
            const res = new Response(reqMsg, sourceSocket);
            // set source to this server channel
            res.setSource(this.channel);
            // set target channel doesn't exist error code
            res.setError(ErrorCode.TARGET_CHANNEL_NONEXIST);
            res.send('', 'json');
            return;
        }
        // forward raw request buffer to target
        targetChannel.socket.write(rawReqBuf);
    }

    _forwardResponseMessage(resMsg, rawResBuf) {
        const target = resMsg.header.target;
        const targetChannel = this._channels.get(target);

        if (!targetChannel) {
            debug(`The target channel '${target}' of Response message does not exist.`);
            return;
        }

        // forward raw response buffer to target
        targetChannel.socket.write(rawResBuf);
    }

    _processInternalRequest(msg, socket) {
        const header = msg.header;
        const topic = header.topic;

        if (this._requestHandlers.hasOwnProperty(topic)) {
            const res = new Response(msg, socket);
            this._requestHandlers[topic].call(this, msg, res);
            return true;
        }
        return false;
    }

    _handleConnection(socket) {
        this._sockets.push(socket);

        socket.on('data', (chunk) => {
            this._msgReceiver.recv(chunk, socket);
        });
        /* eslint-disable handle-callback-err */
        socket.on('error', (err) => {
            socket.unref();
        });
        /* eslint-enable handle-callback-err */

        socket.on('close', () => {
            // remove socket from socket pool
            const socketIndex = this._sockets.indexOf(socket);
            if (socketIndex !== -1) {
                this._sockets.splice(socketIndex, 1);
            }

            // unregister channel
            const channel = this._channels.unregisterBySocket(socket);
            if (channel) {
                this._queueManager.removeChannels(channel);
                debug(`Un-register channel '${channel}'`);
            }
        });
    }

    _shutdown() {
        this._sockets.forEach((socket) => {
            if (socket && socket.destroy) {
                socket.destroy();
            }
        });
        this._sockets = [];
        this._channels.unregisterAll();
    }

    _handleServerError(err) {
        if (err.code === 'EADDRINUSE') {
            if (this._serverOptions.path) {
                this._server.close();
                fs.unlinkSync(this._serverOptions.path);
            } else {
                this._server.close();
            }
            setTimeout(() => {
                this._server.listen(this._serverOptions);
            }, 300);
        } else {
            debug('Message broker server got error:', error.stack);
        }
    }
}

// create(name)
// create(name, port[, host])
exports.create = function(...args) {
    if (arguments.length < 1) {
        throw new Error('Invalid create argument, it needs at least one argument.');
    }

    const options = {};
    // get channel name
    if (args[0] === null || typeof args[0] !== 'string') {
        throw new TypeError('Invalid channel name, channel name must be a string type.');
    } else {
        options.name = args[0];
    }

    if (arguments.length > 1) {
        if (typeof args[1] === 'number' && toNumber(args[1]) !== false) {
            // create(name, port[, host])
            options.port = toNumber(args[1]);
            if (arguments.length > 2 && typeof args[2] === 'string') {
                options.host = args[2];
            }
        }
    }

    if (typeof options.port === 'number' && options.host === undefined) {
        options.host = 'localhost';
    }

    return new Server(options);
};
