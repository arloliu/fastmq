'use strict';
const net = require('net');
const fs = require('fs');
const Promise = require('bluebird');
const EventEmitter = require('eventemitter3');
const globToRegExp = require('glob-to-regexp');
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


class Server
{
    constructor(options)
    {
        // public properties
        this.channel = options.name;

        // private properties
        if (options.port === undefined)
        {
            this._serverOptions = {path: getSocketPath(options.name), exclusive: false};
        }
        else
        {
            this._serverOptions = {
                port: options.port,
                host: options.host,
                exclusive: false
            };
        }

        this._server = null;
        this._sockets = [];

        this._channels = new ChannelManager();
        this._queues = new QueueManager();
        this._msgReceiver = new MessageReceiver();

        this._requestHandlers = {};

        // event emitters
        this._requestEvent = new EventEmitter();
        this._responseEvent = new EventEmitter();

        this._handleConnection = this._handleConnection.bind(this);
        this._handleServerError = this._handleServerError.bind(this);

        // register server channel first
        this._channels.register(this.channel, null);

    }

    _prepareListeners()
    {
        this._server.on('listening', () => {
        });

        this._server.on('connection', this._handleConnection);
        this._server.on('error', this._handleServerError);

        this._msgReceiver.on('error', (err) => {
            debug('Message Receiver error:', err.stack);
        });
        this._msgReceiver.on('message', (msg, rawBuf, socket) => {
            const header = msg.header;
            if (msg.isRequest()) // Request message
            {
                // forward to other client channel
                if (header.target !== this.channel)
                {
                    this._forwardRequestMessage(msg, rawBuf, socket);
                }
                else // handle this request message
                {
                    // process internal requests first, then forward to external
                    // request handlers if request topic doesn't handled by
                    // internal request handler
                    if (!this._processInternalRequest(msg, socket))
                    {
                        const res = new Response(msg, socket);
                        const targetChannel = this._channels.findResponseTopic(
                            this.channel,
                            msg.header.topic
                        );
                        if (!targetChannel)
                        {
                            res.setError(ErrorCode.TOPIC_NONEXIST);
                            res.send('', 'json');
                        }
                        else
                        {
                            this._requestEvent.emit(header.topic, msg, res);
                        }
                    }
                }
            }
            else if (msg.isResponse()) // Response message
            {
                if (header.target !== this.channel)
                {
                    this._forwardResponseMessage(msg, rawBuf);
                }
                else
                {
                    this._responseEvent.emit(msg.getEventName(), msg);
                }
            }
            else if (msg.isPush()) // Push message
            {
                const queue = this._queues.get('pull', header.topic);
                const itemCount = header.itemCount;
                const targetRegExp = globToRegExp(header.target);
                for (let i = 0; i < itemCount; i++)
                {
                    queue.enqueue(msg.items[i], targetRegExp, header.contentType);
                }
                queue.process();
            }
            else if (msg.isPublish()) // Publish message
            {
                const queue = this._queues.get('sub', header.topic);
                const targetRegExp = globToRegExp(header.target);
                queue.enqueue(msg.payloadBuf, targetRegExp, header.contentType);
                queue.process();
            }
            else if (msg.isAck()) // Acknowledge message
            {
                this._queues.handleAck(msg);
            }
        });
    }

    _setupRequestHandlers()
    {
        // setup internal request handlers
        this._requestHandlers.register = (msg, res) => {
            let srcChannel = msg.header.source;
            let socket = res.socket;
            if (this._channels.has(srcChannel))
            {
                debug(`Channel '${srcChannel}' already exist.`);
                res.setError(ErrorCode.REGISTER_FAIL);
            }
            else
            {
                this._channels.register(srcChannel, socket);
                debug(`Register channel '${srcChannel}'`);
            }
            res.send('', 'json');
        };

        this._requestHandlers.addResponseListener = (msg, res) => {
            let name = msg.header.source;
            let channel = this._channels.addResponse(name, msg.payload.topic);
            if (!channel)
                res.setError(ErrorCode.REGISTER_FAIL);
            res.send({result: channel ? true : false}, 'json');
        };

        this._requestHandlers.addPullListener = (msg, res) => {
            let payload = msg.payload;
            let name = msg.header.source;
            let channel = this._channels.addPull(name, payload.topic, payload.options);
            if (!channel)
                res.setError(ErrorCode.REGISTER_FAIL);

            let queue = this._queues.get('pull', payload.topic);
            queue.addChannel(channel);

            res.send({result: channel ? true : false}, 'json');
        };

        this._requestHandlers.addSubscribeListener = (msg, res) => {
            let payload = msg.payload;
            let name = msg.header.source;
            let channel = this._channels.addSubscribe(name, payload.topic, payload.options);
            if (!channel)
                res.setError(ErrorCode.REGISTER_FAIL);

            let queue = this._queues.get('sub', payload.topic);
            queue.addChannel(channel);

            res.send({result: channel ? true : false}, 'json');
        };

    }

    start()
    {
        if (!this._server)
        {
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

    stop()
    {
        return new Promise((resolve, reject) => {
            this._shutdown();
            this._server.close(() => {
                resolve(this);
            });
        });

    }

    // Send request to client channel
    request(target, topic, data = {}, contentType = 'json')
    {
        return new Promise((resolve, reject) => {
            if (!this._channels.contains(target))
                return reject(new Error(`Target channel[${target}] doesn't exist.`));
            try
            {
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
            }
            catch (err)
            {
                reject(err);
            }
        });
    }

    response(topic, listener)
    {
        this._channels.addResponse(this.channel, topic);
        return this._requestEvent.on(topic, (msg, res) => {
            listener(msg, res);
        });
    }

    _forwardRequestMessage(reqMsg, rawReqBuf, sourceSocket)
    {
        const targetChannel = this._channels.findResponseTopic(
            reqMsg.header.target,
            reqMsg.header.topic
        );
        if (!targetChannel)
        {
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

    _forwardResponseMessage(resMsg, rawResBuf)
    {
        const target = resMsg.header.target;
        const targetChannel = this._channels.get(target);

        if (!targetChannel)
        {
            debug(`The target channel '${target}' of Response message does not exist.`);
            return;
        }

        // forward raw response buffer to target
        targetChannel.socket.write(rawResBuf);
    }


    _processInternalRequest(msg, socket)
    {
        const header = msg.header;
        const topic = header.topic;

        if (this._requestHandlers.hasOwnProperty(topic))
        {
            const res = new Response(msg, socket);
            this._requestHandlers[topic].call(this, msg, res);
            return true;
        }
        return false;
    }

    _handleConnection(socket)
    {
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
            if (socketIndex !== -1)
                this._sockets.splice(socketIndex, 1);

            // unregister channel
            let channel = this._channels.unregisterBySocket(socket);
            if (channel)
                debug(`Un-register channel '${channel}'`);

        });
    }

    _shutdown()
    {
        this._sockets.forEach((socket) => {
            if (socket && socket.destroy)
            {
                socket.destroy();
            }
        });
        this._sockets = [];
        this._channels.unregisterAll();
    }

    _handleServerError(err)
    {
        if (err.code === 'EADDRINUSE')
        {
            if (this._serverOptions.path)
            {
                this._server.close();
                fs.unlinkSync(this._serverOptions.path);
            }
            else
            {
                this._server.close();
            }
            setTimeout(() => {
                this._server.listen(this._serverOptions);
            }, 300);
        }
    }
}

// create(name)
// create(name, port[, host])
exports.create = function()
{
    if (arguments.length < 1)
        throw new Error('Invalid create argument, it needs at least one argument.');

    var args = new Array(arguments.length);
    for (let i = 0; i < arguments.length; i++)
        args[i] = arguments[i];

    const options = {};
    // get channel name
    if (args[0] === null || typeof args[0] !== 'string')
        throw new TypeError('Invalid channel name, channel name must be a string type.');
    else
        options.name = args[0];

    if (arguments.length > 1)
    {
        if (typeof args[1] === 'number' && toNumber(args[1]) !== false)
        {
            // create(name, port[, host])
            options.port = toNumber(args[1]);
            if (arguments.length > 2 && typeof args[2] === 'string')
                options.host = args[2];
        }
    }

    if (typeof options.port === 'number' && options.host === undefined)
        options.host = 'localhost';

    return new Server(options);
};
