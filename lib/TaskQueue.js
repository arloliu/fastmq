"use strict";

const debug = require('util').debuglog('fastmq');

const Queue = require('double-ended-queue');

const generateUuid = require('./common').uuid;

const Message = require('./Message.js');

function getChannelHandler(channel, topic) {
  if (!channel.handlers.hasOwnProperty(topic)) {
    return null;
  }

  return channel.handlers[topic];
}

function createMessage(type, item, topic) {
  const msg = Message.create(type, item.id);
  msg.setContentType(item.contentType);
  msg.setTopic(topic);
  msg.setSource(item.source);
  msg.setPayloadBuf(item.data);
  return msg;
}

class TaskQueue {
  constructor(type, topic) {
    this._type = type;
    this._topic = topic;
    this._channels = [];
    this._queue = new Queue(16);
    this._nonAckTasks = {};
    this._channelIndex = 0;
    this._subChannelCache = new Map();
  }

  _updateSubChannelCache(name) {
    const matchedPatterns = [];

    this._subChannelCache.forEach((value, key) => {
      const regex = new RegExp(key);
      debug("TaskQueue._updateSubChannelCache, key: ".concat(key, " regex source: ").concat(regex.source, ", name: ").concat(name));

      if (regex.test(name)) {
        this._subChannelCache.delete(key);

        matchedPatterns.push(regex);
      }
    });

    for (const regex of matchedPatterns) {
      const cache = this._findSubscribeChannels(regex);

      debug("TaskQueue._updateSubChannelCache, Find matched, update channel cache: ".concat(regex.source, ", cache len: ").concat(cache.length));
    }
  }

  addChannel(channel) {
    const handler = getChannelHandler(channel, this._topic);

    if (!handler) {
      return false;
    }

    const channelName = channel.name;
    channel.socket.on('close', () => {
      debug("TaskQueue: socket.close, channel: ".concat(channelName));

      if (handler.type === 'pull') {
        this.redeliver(channelName);
      }

      this.removeChannel(channelName);
    });

    this._channels.push({
      name: channelName,
      socket: channel.socket,
      type: handler.type,
      prefetch: handler.options.prefetch || 1,
      availCount: handler.options.prefetch || 1
    });

    if (!this._queue.isEmpty()) {
      this.process();
    }

    debug("TaskQueue.addChannel name: ".concat(channelName, "  type: ").concat(handler.type));

    if (handler.type === 'subscribe') {
      this._updateSubChannelCache(channelName);
    }

    return true;
  }

  removeChannel(name) {
    const len = this._channels.length;
    let isSubChannel = false;

    for (let i = len - 1; i >= 0; i--) {
      const channel = this._channels[i];

      if (channel.name === name) {
        this._channels.splice(i, 1);

        if (channel.type === 'subscribe') {
          isSubChannel = true;
        }
      }
    }

    if (this._channelIndex >= this._channels.length) {
      this._channelIndex = 0;
    }

    if (isSubChannel) {
      this._updateSubChannelCache(name);
    }
  }

  enqueue(data, targetRegExp, source, contentType) {
    const task = {
      id: generateUuid(),
      targetRegExp: targetRegExp,
      source: source,
      contentType: contentType,
      data: data
    };

    this._queue.enqueue(task);
  }

  process() {
    if (this._type === 'pull') {
      this._processPullMessages();
    } else if (this._type === 'sub') {
      this._processSubscribeMessages();
    }
  }

  redeliver(channelName) {
    for (const id in this._nonAckTasks) {
      if (!Object.prototype.hasOwnProperty.call(this._nonAckTasks, id)) {
        continue;
      }

      const task = this._nonAckTasks[id];

      if (task.channel === channelName) {
        const redeliverTask = {
          id: task.id,
          targetRegExp: task.targetRegExp,
          contentType: task.contentType,
          data: task.data
        };
        debug('redeliver task:', redeliverTask);

        this._queue.enqueue(redeliverTask);

        delete this._nonAckTasks[id];
      }
    }
  }

  handleAck(id) {
    const tasks = this._nonAckTasks;

    if (!tasks.hasOwnProperty(id)) {
      return false;
    }

    const item = tasks[id];
    const len = this._channels.length;

    for (let i = 0; i < len; i++) {
      if (this._channels[i].name === item.channel) {
        this._channels[i].availCount++;
        break;
      }
    }

    delete tasks[id];
    this.process();
    return true;
  }

  _dropTask() {
    const taskQueue = this._queue;
    const curItem = taskQueue.peekFront();

    if (!this._channelMatch(curItem.targetRegExp)) {
      debug('Drop task in queue:', curItem);
      taskQueue.dequeue();
      return true;
    }

    return false;
  }

  _processPullMessages() {
    const taskQueue = this._queue;
    let queueIsEmpty = false;
    let loopCount = 0;
    const maxLoopCount = taskQueue.length * (this._channels.length ? this._channels.length * 2 : 2);

    while (!taskQueue.isEmpty() && this._channelAvailable('pull')) {
      if (loopCount++ >= maxLoopCount) {
        warn('Exceed max. loop trying count:' + maxLoopCount);
        break;
      }

      if (this._dropTask()) {
        continue;
      }

      const curIndex = this._channelIndex;
      const channel = this._channels[curIndex];
      const availCount = channel.availCount;

      for (let i = 0; i < availCount; i++) {
        queueIsEmpty = taskQueue.isEmpty();

        if (queueIsEmpty) {
          break;
        }

        const item = taskQueue.dequeue();
        const msg = createMessage('pull', item, this._topic);
        channel.socket.write(msg.getBuffer());
        channel.availCount--;
        const nonAckItem = {
          id: item.id,
          targetRegExp: item.targetRegExp,
          contentType: item.contentType,
          channel: channel.name,
          data: item.data
        };
        this._nonAckTasks[item.id] = nonAckItem;
      }

      if (!queueIsEmpty) {
        this._nextChannel();
      }
    }
  }

  _processSubscribeMessages() {
    const taskQueue = this._queue;
    debug("Process SUB messages, queue size: ".concat(taskQueue.length));

    while (!taskQueue.isEmpty()) {
      const item = taskQueue.dequeue();

      const subChannels = this._findSubscribeChannels(item.targetRegExp);

      const subChannelLength = subChannels.length;
      debug("item target: ".concat(item.targetRegExp.toString(), ", subChannelLength: ").concat(subChannelLength));
      const msg = createMessage('sub', item, this._topic);

      for (let i = 0; i < subChannelLength; i++) {
        const channel = subChannels[i];
        channel.socket.write(msg.getBuffer());
      }
    }
  }

  _nextChannel() {
    const curIndex = this._channelIndex;
    this._channelIndex = curIndex + 1 < this._channels.length ? curIndex + 1 : 0;
  }

  _channelMatch(regexp) {
    const len = this._channels.length;
    let match = false;

    for (let i = 0; i < len; i++) {
      const channel = this._channels[i];

      if (regexp.test(channel.name)) {
        match = true;
        break;
      }
    }

    return match;
  }

  _channelAvailable(type) {
    const len = this._channels.length;
    let avail = false;

    for (let i = 0; i < len; i++) {
      const channel = this._channels[i];

      if (channel.type === type && channel.availCount > 0) {
        avail = true;
        break;
      }
    }

    return avail;
  }

  _findSubscribeChannels(regexp) {
    const cacheKey = regexp.source;

    const cache = this._subChannelCache.get(cacheKey);

    if (cache) {
      debug("Subscribe channel cache found. len: ".concat(cache.length));
      return cache;
    }

    const len = this._channels.length;
    const channels = [];

    for (let i = 0; i < len; i++) {
      const channel = this._channels[i];

      if (channel.type === 'subscribe' && regexp.test(channel.name)) {
        channels.push(channel);
      }
    }

    debug("Set _subChannelCache, cacheKey: ".concat(cacheKey));

    this._subChannelCache.set(cacheKey, channels);

    return channels;
  }

}

module.exports = TaskQueue;