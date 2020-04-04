'use strict';
const debug = require('util').debuglog('fastmq');
const getChannelRegex = require('./common').getChannelRegex;
const TaskQueue = require('./TaskQueue');

class QueueManager {
    constructor() {
        this._taskQueues = {};
    }

    getTaskQueue(type, topic) {
        // debug(`QueueManager get, type=${type} topic=${topic}`);
        if (!this._taskQueues.hasOwnProperty(topic)) {
            this._taskQueues[topic] = {};
        }
        if (!this._taskQueues[topic].hasOwnProperty(type)) {
            this._taskQueues[topic][type] = new TaskQueue(type, topic);
        }
        return this._taskQueues[topic][type];
    }

    removeTopic(topic) {
        if (this._taskQueues.hasOwnProperty(topic)) {
            delete this._taskQueues[topic];
        }
    }

    removeChannels(name) {
        for (const topic in this._taskQueues) {
            if (!Object.prototype.hasOwnProperty.call(this._taskQueues, topic)) {
                continue;
            }
            const topicQueue = this._taskQueues[topic];
            for (const taskType in topicQueue) {
                if (!Object.prototype.hasOwnProperty.call(topicQueue, taskType)) {
                    continue;
                }
                topicQueue[taskType].removeChannel(name);
            }
        }
    }

    handleAck(msg) {
        const header = msg.header;
        if (!this._taskQueues.hasOwnProperty(header.topic)) {
            return false;
        }
        // only push/pull task nees to handle acknowledge
        if (this._taskQueues[header.topic].hasOwnProperty('pull')) {
            return this._taskQueues[header.topic].pull.handleAck(header.id);
        }
        return false;
    }

    processPublishTask(target, topic, source, payload, contentType) {
        const queue = this.getTaskQueue('sub', topic);
        debug(`processPublishTask target: ${target} topic: ${topic}`);
        const targetRegExp = getChannelRegex(target);
        queue.enqueue(payload, targetRegExp, source, contentType);
        queue.process();
    }

    processPushTasks(target, topic, source, items, contentType) {
        const queue = this.getTaskQueue('pull', topic);
        const itemCount = items.length;
        const targetRegExp = getChannelRegex(target);
        for (let i = 0; i < itemCount; i++) {
            queue.enqueue(items[i], targetRegExp, source, contentType);
        }
        queue.process();
    }
}

module.exports = QueueManager;
