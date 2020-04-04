'use strict';

const getChannelRegex = require('./common').getChannelRegex;

const debug = require('util').debuglog('fastmq');

const Message = require('./Message.js');

function getRandomInt(min, max) {
  const minVal = Math.ceil(min);
  const maxVal = Math.floor(max);
  return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}

class ChannelManager {
  constructor() {
    this._channels = {};
    this._monitorChannels = new Map();
    this._channelCache = new Map();
  }

  has(name) {
    return this._channels.hasOwnProperty(name);
  }

  contains(pattern) {
    const re = getChannelRegex(pattern);

    for (const key in this._channels) {
      if (re.test(key)) {
        return true;
      }
    }

    return false;
  }

  _updateChannelCache(name) {
    const matchedPatterns = [];

    this._channelCache.forEach((value, key, map) => {
      const regex = new RegExp(key);

      if (regex.test(name)) {
        const cacheKey = regex.source;
        map.delete(cacheKey);
        matchedPatterns.push(regex);
      }
    });

    for (const regex of matchedPatterns) {
      this.find(regex);
    }
  }

  _notifyMonitorChannel(action, name) {
    this._monitorChannels.forEach((channels, key) => {
      const regex = new RegExp(key);

      if (regex.test(name)) {
        const msg = Message.create('mon');
        msg.setContentType('json');
        msg.setPayload({
          action: action,
          channelPattern: key,
          channel: name
        });
        const msgBuf = msg.getBuffer();
        channels.forEach(socket => {
          socket.write(msgBuf);
        });
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
      handlers: {}
    };

    this._notifyMonitorChannel('add', name);

    this._updateChannelCache(name);
  }

  unregister(name) {
    debug('unregister channel name: ' + name);
    const socket = this._channels[name].socket;

    this._notifyMonitorChannel('remove', name);

    this.removeMontior(socket);
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
    Object.keys(this._channels).forEach(name => {
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

  addMonitor(channelName, socket) {
    let channelFound = false;
    let channel;

    for (const key in this._channels) {
      channel = this._channels[key];

      if (channel.socket === socket) {
        channelFound = true;
        break;
      }
    }

    if (!channelFound) {
      return false;
    }

    const regex = getChannelRegex(channelName);
    const key = regex.source;

    const availChannels = this._monitorChannels.get(key);

    if (availChannels) {
      availChannels.add(channel.socket);

      this._monitorChannels.set(key, availChannels);
    } else {
      this._monitorChannels.set(key, new Set([channel.socket]));
    }

    debug("addMonitor key=".concat(key));
    const channelNames = this.findChannelNames(regex);
    return {
      channelPattern: key,
      channelNames: channelNames
    };
  }

  removeMontior(socket) {
    this._monitorChannels.forEach((channels, key) => {
      if (channels.has(socket)) {
        debug("removeMontior channel: ".concat(this.findBySocket(socket).name));
        channels.delete(socket);
      }
    });
  }

  get(name) {
    return this.has(name) ? this._channels[name] : null;
  }

  findChannelNames(pattern) {
    const re = getChannelRegex(pattern);
    const channelNames = [];

    for (const key in this._channels) {
      if (re.test(key)) {
        channelNames.push(key);
      }
    }

    return channelNames;
  }

  find(pattern) {
    const re = getChannelRegex(pattern);
    const cacheKey = re.source;
    debug("Find cacheKey: ".concat(cacheKey));

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

  findBySocket(socket) {
    for (const key in this._channels) {
      if (this._channels[key].socket === socket) {
        return this._channels[key];
      }
    }

    return null;
  }

  findResponseTopic(pattern, topic) {
    const channels = this._findTopic('response', pattern, topic);

    if (channels.length === 0) {
      return null;
    }

    if (channels.length === 1) {
      return channels[0];
    }

    return channels[getRandomInt(0, channles.length - 1)];
  }

  findPullTopic(pattern, topic) {
    return this._findTopic('pull', pattern, topic);
  }

  findSubscribeTopic(pattern, topic) {
    return this._findTopic('subscribe', pattern, topic);
  }

  _add(type, name, topic, options) {
    if (!this.has(name)) {
      return false;
    }

    this._channels[name].handlers[topic] = {
      type: type,
      options: options || {}
    };
    return this._channels[name];
  }

  _findTopic(type, pattern, topic) {
    const channels = this.find(pattern);
    const matchedChannels = [];

    for (const key in channels) {
      const channel = channels[key];
      const handlers = channel.handlers;

      if (handlers.hasOwnProperty(topic) && handlers[topic].type === type) {
        matchedChannels.push(channel);
      }
    }

    return matchedChannels;
  }

}

module.exports = ChannelManager;