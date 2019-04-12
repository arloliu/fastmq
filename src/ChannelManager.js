'use strict';
const globToRegExp = require('glob-to-regexp');
const util = require('util');
const debug = util.debuglog('fastmq');

function getRandomInt(min, max) {
    const minVal = Math.ceil(min);
    const maxVal = Math.floor(max);
    return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}

class ChannelManager {
    constructor() {
        this._channels = {};
        this._channelCache = new Map();
    }

    has(name) {
        return this._channels.hasOwnProperty(name);
    }

    contains(nameGlob) {
        const re = globToRegExp(nameGlob);
        for (const key in this._channels) {
            if (re.test(key)) {
                return true;
            }
        }
        return false;
    }

    _updateChannelCache(name) {
        debug(`ChannelManager._updateChannelCache, name: ${name}`);
        this._channelCache.forEach((value, key, map) => {
            const regex = new RegExp(key);
            debug(`ChannelManager._updateChannelCache, regex: ${regex.toString()}, name: ${name}`);
            if (regex.test(name)) {
                debug(`ChannelManager._updateChannelCache, find matched, remove channel cache: ${regex.toString()}`);
                map.delete(regex);
            }
        });
    }

    register(name, socket) {
        if (this.has(name)) {
            delete this._channels[name];
        }
        this._channels[name] = {
            name: name,
            socket: socket,
            handlers: {},
        };
        this._updateChannelCache(name);
    }

    unregister(name) {
        debug('unregister channel name: ' + name);
        delete this._channels[name];
        this._updateChannelCache(name);
    }

    unregisterBySocket(socket) {
        let removeChannelName;
        for (const key in this._channels) {
            if (this._channels[key].socket === socket) {
                this.unregister(key);
                removeChannelName = key;
                break;
            }
        }
        return removeChannelName;
    }

    unregisterAll() {
        Object.keys(this._channels).forEach((name) => {
            this.unregister(name);
        });
    }

    addResponse(name, topic, options) {
        return this._add('response', name, topic, options);
    }

    addPull(name, topic, options) {
        return this._add('pull', name, topic, options);
    }

    addSubscribe(name, topic, options) {
        return this._add('subscribe', name, topic, options);
    }

    get(name) {
        return this.has(name) ? this._channels[name] : null;
    }

    find(nameGlob) {
        const re = globToRegExp(nameGlob);
        const cacheKey = re.source;
        const cache = this._channelCache.get(cacheKey);
        if (cache) {
            return cache;
        }

        const channels = [];
        for (const key in this._channels) {
            if (re.test(key)) {
                channels.push(channel);
            }
        }
        debug('set channel cache, key: ', cacheKey);
        this._channelCache.set(cacheKey, channels);
        return channels;
    }

    findResponseTopic(nameGlob, topic) {
        // Request/Response pattern is 1-1,
        // so we need to return only one channel
        const channels = this._findTopic('response', nameGlob, topic);

        // debug(`findResponseTopic name:${nameGlob} topic: ${topic}, results: ${channels.length}`);
        if (channels.length === 0) {
            return null;
        }
        if (channels.length === 1) {
            return channels[0];
        }
        // choose random one
        return channels[getRandomInt(0, channles.length - 1)];
    }

    findPullTopic(nameGlob, topic) {
        return this._findTopic('pull', nameGlob, topic);
    }

    findSubscribeTopic(nameGlob, topic) {
        return this._findTopic('subscribe', nameGlob, topic);
    }

    _add(type, name, topic, options) {
        // debug(`_add type:${type} name:${name} topic: ${topic}`);
        if (!this.has(name)) {
            return false;
        }
        this._channels[name].handlers[topic] = { type: type, options: options || {} };
        return this._channels[name];
    }

    _findTopic(type, nameGlob, topic) {
        const channels = [];
        const re = globToRegExp(nameGlob);
        const cacheKey = re.source;
        const cache = this._channelCache.get(cacheKey);
        if (cache) {
            for (const key in cache) {
                if (!Object.hasOwnProperty.call(cache, key)) {
                    continue;
                }
                const channel = this._channels[key];
                const handlers = channel.handlers;
                if (handlers.hasOwnProperty(topic) && handlers[topic].type === type) {
                    // debug(`got channel ${key} by type: ${type}, topic: ${topic}`);
                    channels.push(channel);
                }
            }
        } else {
            for (const key in this._channels) {
                if (!Object.hasOwnProperty.call(this._channels, key)) {
                    continue;
                }
                if (re.test(key) || key === nameGlob) {
                    const channel = this._channels[key];
                    const handlers = channel.handlers;
                    if (handlers.hasOwnProperty(topic) && handlers[topic].type === type) {
                        // debug(`got channel ${key} by type: ${type}, topic: ${topic}`);
                        channels.push(channel);
                    }
                }
            }
        }
        return channels;
    }
}

module.exports = ChannelManager;
