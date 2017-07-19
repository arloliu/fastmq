'use strict';
const Queue = require('double-ended-queue');
const generateUuid = require('./common.js').uuid;
const Message = require('./Message.js');
const util = require('util');
const debug = util.debuglog('fastmq');

function getChannelHandler(channel, topic)
{
    if (!channel.handlers.hasOwnProperty(topic))
        return null;
    return channel.handlers[topic];
}

function createMessage(type, item, topic)
{
    const msg = Message.create(type, item.id);
    msg.setContentType(item.contentType);
    msg.setTopic(topic);
    msg.setPayloadBuf(item.data);
    return msg;
}

class TaskQueue
{
    constructor(type, topic)
    {
        this._type = type;
        this._topic = topic;
        this._channels = [];
        this._taskQueue = new Queue(16);
        this._nonAckTasks = {};
        this._channelIndex = 0;
    }

    addChannel(channel)
    {
        const handler = getChannelHandler(channel, this._topic);
        if (!handler)
            return false;

        const channelName = channel.name;
        channel.socket.on('close', () => {
            debug(`TaskQueue: socket.close, channel: ${channelName}`);
            if (handler.type === 'pull')
                this.redeliver(channelName);
            this.removeChannel(channelName);
        });

        this._channels.push({
            name: channelName,
            socket: channel.socket,
            type: handler.type,
            prefetch: handler.options.prefetch || 1,
            availCount: handler.options.prefetch || 1,
        });


        // flush task in queue when new channel added
        if (!this._taskQueue.isEmpty())
            this.process();
    }

    removeChannel(name)
    {
        const len = this._channels.length;
        for (let i = len - 1; i >= 0; i--)
        {
            let channel = this._channels[i];
            if (channel.name === name)
            {
               this._channels.splice(i, 1);
            }
        }

        if (this._channelIndex >= this._channels.length)
            this._channelIndex = 0;
    }

    enqueue(data, targetRegExp, contentType)
    {
        const task = {
            id: generateUuid(),
            targetRegExp: targetRegExp,
            contentType: contentType,
            data: data
        };
        this._taskQueue.enqueue(task);
    }

    process()
    {
        if (this._type === 'pull')
            this._processPullMessages();
        else if (this._type === 'sub')
            this._processSubscribeMessages();
    }

    redeliver(channelName)
    {
        for (let id in this._nonAckTasks)
        {
            const task = this._nonAckTasks[id];
            if (task.channel === channelName)
            {
                const redeliverTask = {
                    id: task.id,
                    targetRegExp: task.targetRegExp,
                    contentType: task.contentType,
                    data: task.data
                };
                debug('redeliver task:', redeliverTask);
                this._taskQueue.enqueue(redeliverTask);

                delete this._nonAckTasks[id];
            }
        }
    }

    handleAck(id)
    {
        const tasks = this._nonAckTasks;

        if (!tasks.hasOwnProperty(id))
            return false;

        const item = tasks[id];

        //debug('Handle Ack, item id:' + id);

        const len = this._channels.length;
        for (let i = 0; i < len; i++)
        {
            if (this._channels[i].name === item.channel)
            {
                this._channels[i].availCount++;
                break;
            }
        }
        delete tasks[id];
        // run process again when receive acknowledge
        this.process();

        return true;
    }

    _dropTask()
    {
        const taskQueue = this._taskQueue;
        const curItem = taskQueue.peekFront();
        if (!this._channelMatch(curItem.targetRegExp))
        {
            debug('Drop task in queue:', curItem);
            // drop task when no channel matches current task item
            taskQueue.dequeue();
            return true;
        }
        return false;
    }

    _processPullMessages()
    {
        const taskQueue = this._taskQueue;
        let queueIsEmpty = false;

        //const channelAvailable = this._channelAvailable('pull');
        //debug(`Channel available: ${channelAvailable}, queue size: ${taskQueue.length}`);

        let loopCount = 0;
        const maxLoopCount = taskQueue.length * (this._channels.length ? this._channels.length * 2 : 2);
        while (!taskQueue.isEmpty() && this._channelAvailable('pull'))
        {
            if (loopCount++ >= maxLoopCount)
            {
                warn('Exceed max. loop trying count:' + maxLoopCount);
                break;
            }

            if (this._dropTask())
                continue;

            const curIndex = this._channelIndex;
            const channel = this._channels[curIndex];
            const availCount = channel.availCount;

            //debug(`current channel name: ${channel.name}, type: ${channel.type} availCount: ${availCount}, queue size: ${taskQueue.length}`);

            for (let i = 0; i < availCount; i++)
            {
                queueIsEmpty = taskQueue.isEmpty();
                if (queueIsEmpty)
                    break;

                // dequeue task and write pull messsage to channel
                let item = taskQueue.dequeue();
                let msg = createMessage('pull', item, this._topic);
                channel.socket.write(msg.getBuffer());
                channel.availCount--;

                // add current item to non-ack. task
                const nonAckItem = {
                    id: item.id,
                    targetRegExp: item.targetRegExp,
                    contentType: item.contentType,
                    channel: channel.name,
                    data: item.data
                };
                this._nonAckTasks[item.id] = nonAckItem;
            }

            if (!queueIsEmpty)
            {
                // set channel index to next
                this._nextChannel();
            }
        }
    }

    _processSubscribeMessages()
    {
        const taskQueue = this._taskQueue;
        debug(`Process SUB messages, queue size: ${taskQueue.length}`);

        while (!taskQueue.isEmpty())
        {

            const item = taskQueue.dequeue();
            const subChannels = this._getSubscribeChannels(item.targetRegExp);
            const subChannelLength = subChannels.length;

            debug(`item target: ${item.targetRegExp.toString()}, subChannelLength: ${subChannelLength}`);

            const msg = createMessage('sub', item, this._topic);
            for (let i = 0; i < subChannelLength; i++)
            {
                let channel = subChannels[i];
                debug('socket write');
                channel.socket.write(msg.getBuffer());
            }
        }
    }


    _nextChannel()
    {
        const curIndex = this._channelIndex;
        this._channelIndex = (curIndex + 1 < this._channels.length) ? curIndex + 1 : 0;
    }

    _channelMatch(regexp)
    {
        const len = this._channels.length;
        let match = false;
        for (let i = 0; i < len; i++)
        {
            let channel = this._channels[i];
            if (regexp.test(channel.name))
            {
                match = true;
                break;
            }
        }
        return match;
    }

    _channelAvailable(type)
    {
        const len = this._channels.length;
        let avail = false;
        for (let i = 0; i < len; i++)
        {
            let channel = this._channels[i];
            if (channel.type === type && channel.availCount > 0)
            {
                avail = true;
                break;
            }
        }
        return avail;
    }

    _getSubscribeChannels(regexp)
    {
        const len = this._channels.length;
        let channels = [];
        for (let i = 0; i < len; i++)
        {
            let channel = this._channels[i];
            if (channel.type === 'subscribe' && regexp.test(channel.name))
            {
                channels.push(channel);
            }
        }
        return channels;
    }

}

class QueueManager
{
    constructor()
    {
        this._taskQueues = {};
    }

    get(type, topic)
    {
        //debug(`QueueManager get, type=${type} topic=${topic}`);
        if (!this._taskQueues.hasOwnProperty(topic))
            this._taskQueues[topic] = {};
        if (!this._taskQueues[topic].hasOwnProperty(type))
            this._taskQueues[topic][type] = new TaskQueue(type, topic);
        return this._taskQueues[topic][type];
    }

    removeTopic(topic)
    {
        if (this._taskQueues.hasOwnProperty(topic))
            delete this._taskQueues[topic];
    }

    removeChannels(name)
    {
        for (let topic in this._taskQueues)
        {
            for (let taskType in this._taskQueues[topic])
            {
                this._taskQueues[topic][taskType].removeChannel(name);
            }
        }
    }

    handleAck(msg)
    {
        const header = msg.header;
        if (!this._taskQueues.hasOwnProperty(header.topic))
            return false;
        // only push/pull task nees to handle acknowledge
        if (this._taskQueues[header.topic].hasOwnProperty('pull'))
            return this._taskQueues[header.topic].pull.handleAck(header.id);
        return false;
    }
}


module.exports = QueueManager;
