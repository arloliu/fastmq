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

    contains(pattern) {
        const re = (pattern instanceof RegExp) ? pattern : globToRegExp(pattern);
        for (const key in this._channels) {
            if (re.test(key)) {
                return true;
            }
        }
        return false;
    }

    _updateChannelCache(name) {
        debug(`ChannelManager._updateChannelCache, name: ${name}`);
        const matchedPatterns = [];
        this._channelCache.forEach((value, key, map) => {
            const regex = new RegExp(key);
            debug(`ChannelManager._updateChannelCache, regex: ${regex.toString()}, name: ${name}`);
            if (regex.test(name)) {
                const cacheKey = regex.source;
                map.delete(cacheKey);
                matchedPatterns.push(regex);
            }
        });
        for (const regex of matchedPatterns) {
            debug(`ChannelManager._updateChannelCache, find matched, update channel cache: ${regex.source}`);
            // update new cache
            this.find(regex);
        }
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

    find(pattern) {
        const re = (pattern instanceof RegExp) ? pattern : globToRegExp(pattern);
        const cacheKey = re.source;
        debug(`Find cacheKey: ${cacheKey}`);
        const cache = this._channelCache.get(cacheKey);
        if (cache) {
            return cache;
        }

        const channels = [];
        for (const key in this._channels) {
            if (re.test(key)) {
                channels.push(this._channels[key]);
            }
        }
        debug('set channel cache, key: ', cacheKey);
        this._channelCache.set(cacheKey, channels);
        return channels;
    }

    findResponseTopic(pattern, topic) {
        // Request/Response pattern is 1-1,
        // so we need to return only one channel
        const channels = this._findTopic('response', pattern, topic);

        // debug(`findResponseTopic name:${pattern} topic: ${topic}, results: ${channels.length}`);
        if (channels.length === 0) {
            return null;
        }
        if (channels.length === 1) {
            return channels[0];
        }
        // choose random one
        return channels[getRandomInt(0, channles.length - 1)];
    }

    findPullTopic(pattern, topic) {
        return this._findTopic('pull', pattern, topic);
    }

    findSubscribeTopic(pattern, topic) {
        return this._findTopic('subscribe', pattern, topic);
    }

    _add(type, name, topic, options) {
        // debug(`_add type:${type} name:${name} topic: ${topic}`);
        if (!this.has(name)) {
            return false;
        }
        this._channels[name].handlers[topic] = { type: type, options: options || {} };
        return this._channels[name];
    }

    _findTopic(type, pattern, topic) {
        const channels = this.find(pattern);
        const matchedChannels = [];
        /* eslint-disable-next-line guard-for-in */
        for (const key in channels) {
            const channel = channels[key];
            const handlers = channel.handlers;
            if (handlers.hasOwnProperty(topic) && handlers[topic].type === type) {
                // debug(`got channel ${key} by type: ${type}, topic: ${topic}`);
                matchedChannels.push(channel);
            }
        }
        return matchedChannels;
        // const channels = [];
        // const re = globToRegExp(pattern);
        // const cacheKey = re.source;
        // const cache = this._channelCache.get(cacheKey);
        // if (cache) {
        //     for (const key in cache) {
        //         if (!Object.hasOwnProperty.call(cache, key)) {
        //             continue;
        //         }
        //         const channel = this._channels[key];
        //         const handlers = channel.handlers;
        //         if (handlers.hasOwnProperty(topic) && handlers[topic].type === type) {
        //             // debug(`got channel ${key} by type: ${type}, topic: ${topic}`);
        //             channels.push(channel);
        //         }
        //     }
        // } else {
        //     for (const key in this._channels) {
        //         if (!Object.hasOwnProperty.call(this._channels, key)) {
        //             continue;
        //         }
        //         if (re.test(key) || key === pattern) {
        //             const channel = this._channels[key];
        //             const handlers = channel.handlers;
        //             if (handlers.hasOwnProperty(topic) && handlers[topic].type === type) {
        //                 // debug(`got channel ${key} by type: ${type}, topic: ${topic}`);
        //                 channels.push(channel);
        //             }
        //         }
        //     }
        // }
        // return channels;
    }
}

module.exports = ChannelManager;
