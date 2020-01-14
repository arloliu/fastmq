# FastMQ
> High performance message broker for node.js with multiple network transports support.

**Table of Contents**
- [FastMQ](#fastmq)
  - [Overview](#overview)
  - [Features](#features)
  - [Installation](#installation)
  - [Examples](#examples)
    - [Simple REQUEST/RESPONSE server and client](#simple-requestresponse-server-and-client)
    - [Simple REQUEST/RESPONSE pattern between two clients](#simple-requestresponse-pattern-between-two-clients)
    - [Simple PUSH/PULL pattern, one PUSH, two PULL workers](#simple-pushpull-pattern-one-push-two-pull-workers)
    - [Simple PUBLISH/SUBSCRIBE pattern, one PUBLISH, two SUBSCRIBE channels](#simple-publishsubscribe-pattern-one-publish-two-subscribe-channels)
- [API](#api)
  - [FastMQ.Server.create(name)](#fastmqservercreatename)
  - [FastMQ.Server.create(name, port[, host])](#fastmqservercreatename-port-host)
  - [Class: FastMQ.Server](#class-fastmqserver)
    - [server.start()](#serverstart)
    - [server.stop()](#serverstop)
    - [server.request(target, topic, payload = {}, contentType = 'json')](#serverrequesttarget-topic-payload---contenttype--json)
    - [server.response(topic, listener)](#serverresponsetopic-listener)
    - [server.onError(handler)](#serveronerrorhandler)
    - [server.onSocketError(handler)](#serveronsocketerrorhandler)
  - [FastMQ.Client.connect(channelName, path[, connectListener])](#fastmqclientconnectchannelname-path-connectlistener)
  - [FastMQ.Client.connect(channelName, port[, host][, connectListener])](#fastmqclientconnectchannelname-port-host)
  - [FastMQ.Client.connect(channelName, options[, connectListener])](#fastmqclientconnectchannelname-options-connectlistener)
  - [Class: FastMQ.Channel](#class-fastmqchannel)
    - [channel.onError(listener)](#channelonerrorlistener)
    - [channel.onReconnect(listener)](#channelonreconnectlistener)
    - [channel.disconnect(graceful)](#channeldisconnectgraceful)
    - [channel.request(target, topic, data = {}, contentType = 'json')](#channelrequesttarget-topic-data---contenttype--json)
    - [channel.response(topic, listener)](#channelresponsetopic-listener)
    - [channel.push(target, topic, items, contentType = 'json')](#channelpushtarget-topic-items-contenttype--json)
    - [channel.pull(topic, options, listener)](#channelpulltopic-options-listener)
    - [channel.publish(target, topic, payload, contentType = 'json')](#channelpublishtarget-topic-payload-contenttype--json)
      - [channel.subscribe(topic, listener)](#channelsubscribetopic-listener)
      - [channel.getChannels(name[, type])](#channelgetchannelsname-type)
      - [channel.watchChannels(name, callback)](#channelwatchchannelsname-callback)
  - [Class: FastMQ.Message](#class-fastmqmessage)
    - [message.header](#messageheader)
    - [message.payload](#messagepayload)
    - [message.setError(code)](#messageseterrorcode)
    - [message.isError(value)](#messageiserrorvalue)
  - [Class: FastMQ.Response](#class-fastmqresponse)
    - [response.send(payload, contentType)](#responsesendpayload-contenttype)
  - [List of Error Codes](#list-of-error-codes)

## Overview
FastMQ is a node.js based message broker aims to let programmer easy to commuicate between different processes or machines.
It is designed for high performance which can achieve to over 30000 message delivery per second with 64KB message payload, and with small size header overhead.

It support both local socket(Unix domain socket and Windows pipe) for local process communication, and also supports reliable TCP connections between machines.

Which makes FastMQ suitable as backend service for IPC, clusters, and micro service applications.


## Features
* Pure javascript and asynchronous message broker, compatiable with node.js >= 4.x
* Easy to communicate between proceeses and machines
* All major functions support Promise for better async. programming
* Small extra size overhead with packed binary header
* Support various of payload formats: JSON, Raw Binary and Plain Text
* Support **REQUEST/RESPONSE** pattern for executing asynchronous Remote Procedure Call (RPC)
* Support **PUSH/PULL** pattern for distributing large number of tasks among workers
* Support **PUBLISH/SUBSCRIBE** pattern for sending messages to many consumers at once
* Support Unix domain socket / Windows pipe and TCP socket
* GLOB topic expression to specify message routing

## Installation
Install FastMQ via npm or yarn
```shell
npm install fastmq
```
```shell
yarn add fastmq
```

## Examples

### Simple REQUEST/RESPONSE server and client

Server.js: Simple server handle 'test_cmd' topic request
```javascript
const FastMQ = require('fastmq');

// Create message broker server with 'master' channel name
const server = FastMQ.Server.create('master');

// Register topic: 'test_cmd', receive message and response back to client requester
server.response('test_cmd', (msg, res) => {
    console.log('Server receive request payload:', msg.payload);
    // echo request data back;
    let resData = {data: msg.payload.data};
    res.send(resData, 'json');
});

// start server
server.start().then(() => {
    console.log('Message Broker server started');
});
```

Simple client send 'test_cmd' topic to server('master' channel)
```javascript
const FastMQ = require('fastmq');

var requestChannel;
// create a client with 'requestChannel' channel name and connect to server.
FastMQ.Client.connect('requestChannel', 'master')
.then((channel) => {
    // client connected
    requestChannel = channel;

    // send request to 'master' channel  with topic 'test_cmd' and JSON format payload.
    let reqPayload = {data: 'reqeust data'};
    return requestChannel.request('master', 'test_cmd', reqPayload, 'json');
})
.then((result) => {
    console.log('Got response from master, data:' + result.payload.data);
    // client channel disconnect
    requestChannel.disconnect();
})
.catch((err) => {
    console.log('Got error:', err.stack);
});
```


### Simple REQUEST/RESPONSE pattern between two clients

Client1.js: Connect to server, register 'responseChannel' channel, and handle 'test_cmd' topic
```javascript
const FastMQ = require('fastmq');

var responseChannel;
// create a client with 'requestChannel' channel name and connect to server.
FastMQ.Client.connect('responseChannel', 'master')
.then((channel) => {
    // client connected
    responseChannel = channel;
    responseChannel.response('test_cmd', (msg, res) => {
        console.log('Receive request payload:', msg.payload);
        // echo request data back;
        let resData = {data: msg.payload.data};
        res.send(resData, 'json');
    });

})
.catch((err) => {
    console.log('Got error:', err.stack);
});
```

Client2.js: Connect to server, register 'requestChannel' channel, and send 'test_cmd' request
```javascript
const FastMQ = require('fastmq');

var requestChannel;
// create a client with 'requestChannel' channel name and connect to server.
FastMQ.Client.connect('requestChannel', 'master')
.then((channel) => {
    // client connected
    requestChannel = channel;
    let reqPayload = {data: 'reqeust data'};

    // send request to 'responseChannel' channel  with topic 'test_cmd' and JSON format payload.
    return requestChannel.request('responseChannel', 'test_cmd', reqPayload, 'json');
})
.then((result) => {
    console.log('Got response from master, data:' + result.payload.data);
    // client channel disconnect
    requestChannel.disconnect();
})
.catch((err) => {
    console.log('Got error:', err.stack);
});
```


### Simple PUSH/PULL pattern, one PUSH, two PULL workers

push_client.js: Push 'add_job' message to all channels match 'worker*' GLOB expression
```javascript
const FastMQ = require('fastmq');

var pushChannel;
// create a client with 'pushChannel' channel name and connect to server.
FastMQ.Client.connect('pushChannel', 'master')
.then((channel) => {
    pushChannel = channel;

    // generate 10 tasks
    var data = [];
    for (let i = 1; i <= 10; i++)
        data.push({id: 'job' + i});

    // push tasks to 'worker*' channels
    return pushChannel.push('worker*', 'add_job', data);
})
.then(() => {
    console.log('Push 10 tasks to worker*:add_job');
    pushChannel.disconnect();
})
.catch((err) => {
    console.log('Got error:', err.stack);
});
```

worker1.js: Pull 'add_job'
```javascript
const FastMQ = require('fastmq');

var workerChannel;
// create a client with 'worker1' channel name and connect to server.
FastMQ.Client.connect('worker1', 'master')
.then((channel) => {
    workerChannel = channel;

    // handle 'add_job' push message
    workerChannel.pull('add_job', (msg) => {
        console.log('Worker1 receive job:', msg.payload.id);
    });
})
.catch((err) => {
    console.log('Got error:', err.stack);
});
```

worker2.js: Pull 'add_job'
```javascript
const FastMQ = require('fastmq');

var workerChannel;
// create a client with 'worker2' channel name and connect to server.
FastMQ.Client.connect('worker2', 'master')
.then((channel) => {
    workerChannel = channel;

    // handle 'add_job' push message
    workerChannel.pull('add_job', (msg) => {
        console.log('Worker2 receive job:', msg.payload.id);
    });
})
.catch((err) => {
    console.log('Got error:', err.stack);
});
```


### Simple PUBLISH/SUBSCRIBE pattern, one PUBLISH, two SUBSCRIBE channels
publish.js: Publish 'log' message to to all channels match 'console.*' GLOB expression
```javascript
const FastMQ = require('fastmq');

var pubChannel;
FastMQ.Client.connect('publisher', 'master')
.then((channel) => {
    pubChannel = channel;
    return pubChannel.publish('console.*', 'log', {data: 'a example log'}, 'json');
})
.then(() => {
    console.log('Push log to console.*');
    pubChannel.disconnect();
})
.catch((err) => {
    console.log('Got error:', err.stack);
});
```

console1.js: 'console.1' channel, subscribe 'log' topic
```javascript
const FastMQ = require('fastmq');

var subChannel;
FastMQ.Client.connect('console.1', 'master')
.then((channel) => {
    subChannel = channel;

    // subscribe 'log' topic
    subChannel.subscribe('log', (msg) => {
        console.log('Console.1 receive log:', msg.payload.data);
    });
})
.catch((err) => {
    console.log('Got error:', err.stack);
});
```

console2.js: 'console.2' channel, subscribe 'log' topic
```javascript
const FastMQ = require('fastmq');

var subChannel;
FastMQ.Client.connect('console.2', 'master')
.then((channel) => {
    subChannel = channel;

    // subscribe 'log' topic
    subChannel.subscribe('log', (msg) => {
        console.log('Console.2 receive log:', msg.payload.data);
    });
})
.catch((err) => {
    console.log('Got error:', err.stack);
});
```


# API
FastMQ contains serveral major classes:

1. FastMQ.Server: Message broker server.
2. FastMQ.Client: Message broker client.
3. FastMQ.Channel: Message broker client channel which created by FastMQ.Client.connect.
4. FastMQ.Message: Generic message class which contains message header and payload.
5. FastMQ.Response: The response helper in response listener to send response payload


## FastMQ.Server.create(name)
* `name`: <String> - the channel name of server.

A factory function, create local socket message broker server. It create a UNIX domain socket or Windows named PIPE to accept local communication between proccesses.

**Return Value**: `FastMQ.Server` object


## FastMQ.Server.create(name, port[, host])
* `name`: &lt;String> - the channel name of server.
* `port`: &lt;Number> - listen port of this server.
* `host`: &lt;String> - listen hostname of this server, defaults to 'localhost'.

A factory function, reate TCP socket message broker server. It's useful to communication between different machines.

**Return Value**: `FastMQ.Server` object



## Class: FastMQ.Server
A local or TCP message broker server.


### server.start()
Start server. It is an async. operation which return a &lt;Promise> and resolve when server has been started.

**Return Value**: A &lt;Promise> that is resolved with &lt;FastMQ.Server> object.


### server.stop()
Stop server. It is an async. operation which return a &lt;Promise> and resolve when server has been  stopped.

**Return Value**: A &lt;Promise> that is resolved with &lt;FastMQ.Server> object.


### server.request(target, topic, payload = {}, contentType = 'json')
* `target`: &lt;String> -  target channel name to send request, support GLOB expression, ex: 'log.*.debug'.
* `topic`: &lt;String> - topic name of this request.
* `payload`: &lt;Object>|&lt;Buffer>|&lt;String> - payload of this request, the type of this parameter depends on `contentType` parameter.
* `contentType`: &lt;String> - content type of `payload`. Valid values: 'json', 'raw', 'string'.

Send a REQUEST message to the `target` channel which listen `topic`, and return a &lt;Promise> which resolved with a RESPONSE message.

Due to the one-2-one behavior of REQUEST/RESPONSE, message broker will choose only one channel automatically if multiple channels matches `target`.

For example, there are two channels 'worker.1' and 'worker.2' listen a topic 'doSomething', and a channel sends a request to `target` 'worker.*' with 'doSomething' `topic`. The message broker will choose one channel of 'worker.1' and 'worker.2' to send/receive message.

If you want to send message from one channel to multiple channels, you might perfer to use PUSH/PULL or PUBLISH/SUBSCRIBE pattern.

**Return Value**: A &lt;Promise> that is resolved with &lt;FastMQ.Message> object.


### server.response(topic, listener)
* `topic`: &lt;String> - topic name to listen.
* `listener`: &lt;Function> - The callback to handle request message.

Listen `topic` to receive REQUEST message and send response.

The `listener` is passed with two parameters `(req, res)`, where `req` is a &lt;FastMQ.Message> object contains request message, and `res` is a &lt;FastMQ.Response> object to send response back to request channel.

This method returns current server object, which can be used as Method Chaining syntax, for example:

```javascript
server.response('topic1', listener1).response('topic2', listener2);
```

**Return Value**: An &lt;FastMQ.Server> object.

### server.onError(handler)
* `handler`: &lt;Function> - The callback to handle server error event.

Register callback handler for server error event

### server.onSocketError(handler)
* `handler`: &lt;Function> - The callback to handle client socket error event.

Register callback handler for client socket error event

---
## FastMQ.Client.connect(channelName, path[, connectListener])
* `channelName`: &lt;String | null> - the channel name created by this method. Set it to `null` or empty string for anonymous channel. It can also be a string combines with `#` character to generate a unique name by server, ex: Pass `test_channel.#` to server, and server will generate `test_channel.x1ase3ds` channel, and guarantee uniqueness.
* `path`: &lt;String> - local socket path.
* `connectListener`: &lt;Function> - Optional - listener when connect to server.

A factory function, returns a new `FastMQ.Channel` object and connect to the local socket message broker server.

The `listener` is passed with two parameters `(err, channel)`, where `err` is a &lt;Error> object when connect fail or `null` when connect success, and `channel` is a &lt;FastMQ.Channel> object.

It supports two different styles, node.js callback style when specify `connectListener` or Promise style which returns a Promise object that is resolved with new &lt;FastMQ.Channel> object when connect success or rejected if not.

> It also supports anonymous channel feature since `v1.1.2`, which solves channel name conflicting problem. A unique channel name will be created by server, fill it into `channel` object and returns to client.

**Return Value**: A &lt;Promise> that is resolved with new &lt;FastMQ.Channel> object when connected success or rejected if not.



## FastMQ.Client.connect(channelName, port[, host][, connectListener])
* `channelName`: &lt;String | null> - the channel name created by this method. Set it to `null` or empty string for anonymous channel. It can also be a string combines with `#` character to generate a unique name by server, ex: Pass `test_channel.#` to server, and server will generate `test_channel.x1ase3ds` channel, and guarantee uniqueness.
* `port`:&lt;Number> - server listening port.
* `host`:&lt;String> - Optional - server host name, defaults to 'localhost'.
* `connectListener`: &lt;Function> - Optional - The callback when connect to server.

A factory function, returns a new `FastMQ.Channel` object and connect to the TCP socket message broker server.

It supports both callback and Promise styles.

> It also supports anonymous channel feature since `v1.1.2`, which solves channel name conflicting problem. A unique channel name will be created by server, fill it into `channel` object and returns to client.

**Return Value**: A &lt;Promise> that is resolved with new &lt;FastMQ.Channel> object when connected success or rejected if not.

## FastMQ.Client.connect(channelName, options[, connectListener])
* `channelName`: &lt;String | null> - the channel name created by this method. Set it to `null` or empty string for anonymous channel. It can also be a string combines with `#` character to generate a unique name by server, ex: Pass `test_channel.#` to server, and server will generate `test_channel.x1ase3ds` channel, and guarantee uniqueness.
* `options`:&lt;Object> - connection options.
* `connectListener`: &lt;Function> - Optional - The callback when connect to server.

> New Method Since `v1.2.0`

A factory function, returns a new `FastMQ.Channel` object and connect to the TCP/local socket message broker server.

Like above two `connect` methods but use `options` argument to setup connection options.

The `options` contains parameters:
* `host`:&lt;String> - server host name, defaults to 'localhost'. *This parameter are only be used in TCP mode*.
* `port`:&lt;Number> - server listening port. *This parameter are only be used in TCP mode*.
* `path`:&lt;String> - local socket path. *This parameter are only be used in local socket mode*.
* `reconnect`:&lt;Boolean> - enable reconnect feature or not, deafults to `true`.
* `reconnectInterval`:&lt;Number> - reconnect interval, unit is `ms`, defaults to `1000`.

It supports both callback and Promise styles.

> It also supports anonymous channel feature since `v1.1.2`, which solves channel name conflicting problem. A unique channel name will be created by server, fill it into `channel` object and returns to client.

**Return Value**: A &lt;Promise> that is resolved with new &lt;FastMQ.Channel> object when connected success or rejected if not.

> Since `v1.1.3`, ALL `connect` methods provide advanced unique channel name feature which can combine name prefix/suffix with unique name by special character `#`. ex: `#-channel` will be translated to `<unique_id>-channel`, and `channel.#` will be translated to `channel.<unique_id>`. Which `<unique_id>` is a unique ID number generated by server and guarantee uniqueness.

## Class: FastMQ.Channel
Message channel created by FastMQ.Client.connect method.

### channel.onError(listener)
`listener`:  &lt;Function> - The callback to handle error.

Add `listener` to handle error.

The `listener` callback function is passed with one parameter `(err)`, where `err` is a &lt;Error> object.

### channel.onReconnect(listener)
`listener`:  &lt;Function> - The callback for reconnection.

> New Method Since `v1.2.0`

Add `listener` to handle reconnection, it will be triggeed after client reconnected sucessfully.

The `listener` callback function is passed with no parameter.

### channel.disconnect(graceful)
* `graceful`: &lt;Boolean> - graceful disconnect client, defaults to `false` *New parameter since v1.2.0*

Disconnect channel, in graceful mode, this mehod acts as asynchronous function, which return &lt;Promise> instance and resolved after received `FIN` packet from server.

**Return Value**: A &lt;Promise> if graceful mode

### channel.request(target, topic, data = {}, contentType = 'json')
* `target`: &lt;String> -  target channel name to send request, support GLOB expression, ex: 'log.*.debug'.
* `topic`: &lt;String> - topic name of this request.
* `payload`: &lt;Object>|&lt;Buffer>|&lt;String> - payload of this request, the type of this parameter depends on `contentType` parameter.
* `contentType`: &lt;String> - content type of `payload`. Valid values: 'json', 'raw', 'string'.

Send a REQUEST message to the `target` channel which listen `topic`, and return a &lt;Promise> which resolved with  RESPONSE message.

Due to the one-to-one behavior of REQUEST/RESPONSE, message broker will choose only one channel automatically if multiple channels matches `target`.

For example, there are two channels 'worker.1' and 'worker.2' listen a topic 'doSomething', and a channel sends a request to `target` 'worker.*' with 'doSomething' `topic`. The message broker will choose one channel of 'worker.1' and 'worker.2' to send/receive message.

If you want to send message from one channel to multiple channels, you might perfer to use PUSH/PULL or PUBLISH/SUBSCRIBE pattern.

**Return Value**: A &lt;Promise> that is resolved with &lt;FastMQ.Message> object.



### channel.response(topic, listener)
* `topic`: &lt;String> - topic name to listen.
* `listener`: &lt;Function> - The callback to handle request message.

Listen `topic` to receive REQUEST message and send response.

The `listener` is passed with two parameters `(req, res)`, where `req` is a &lt;FastMQ.Message> object contains request message, and `res` is a &lt;FastMQ.Response> object to send response back to request channel.

This method returns current channel object, which can be used as Method Chaining syntax, for example:

```javascript
channel.response('topic1', listener1).response('topic2', listener2);
```

**Return Value**: An &lt;FastMQ.Channel> object.



### channel.push(target, topic, items, contentType = 'json')
* `target`: &lt;String> -  target channel name to send request, support GLOB expression.
* `topic`: &lt;String> - topic name of this request.
* `items`: &lt;Array> - the array of payloads.
* `contentType`: &lt;String> - content type of `items` payloads. Valid values: 'json', 'raw', 'string'.

Send PUSH message to the `target` channel which listen `topic`. A PUSH message can contain multiple items, which packs in `items` parameters.

The `items` is an &lt;Array> contains multiple payloads, for example:
```javascript
// three 'json' payloads
const items = [{data: 'item1'}, {data: 'item2'}, {data: 'item3'}]
```

PUSH/PULL is a many-to-one pattern, multiple PUSH endpoints push to one queue, and multiple PULL endpoints pull payload from this queue.

**Return Value**: A &lt;Promise> that is resolved when this channel pushed message to message broker.



### channel.pull(topic, options, listener)
* `topic`: &lt;String> - topic name to listen.
* `options`: &lt;Object> - options
* `listener`: &lt;Function> - The callback to handle push message.

Receive PUSH message which matches the `topic` with `listener` callback, it will be invoked to receive one PUSH item, and continue to receive PUSH items until consumed completely.

Every time after the `listener` be invoked, it will send an Acknowledge message back to broker, and the broker will send further PUSH items. When any PULL channel crash/close without sending acknowledge message back, broker will re-deliver the item again.

The `listener` is passed with one parameters `(msg)`, where `msg` is a &lt;FastMQ.Message> contains one PUSH item in `msg.payload`.

The `options` is an object with the following defaults:

```javascript
{
    prefetch: 1
}
```

The `prefetch` is a &lt;Number> to tell message broker that how many PUSH items can be received by this channel without acknowledge. The higher value of `prefetch` might help to reduce round-trip costs between PULL and PUSH channels, but might causes load unbalance when multiple PULL channels listen on the same `topic`.

This method returns current channel object, which can be used as Method Chaining syntax.

**Return Value**: An &lt;FastMQ.Channel> object.


### channel.publish(target, topic, payload, contentType = 'json')
* `target`: &lt;String> -  target channel name to send request, support GLOB expression.
* `topic`: &lt;String> - topic name of this request.
* `payload`: &lt;Object>|&lt;Buffer>|&lt;String> - payload of this publish message, the type of this parameter depends on `contentType` parameter.
* `contentType`: &lt;String> - content type of `items` payloads. Valid values: 'json', 'raw', 'string'.

Send PUSH message to the `target` channel which listen `topic`. All SUBSCRIBE channels listening on the `topic` and match `target` will receive the same message.

Unlike PUSH/PULL, PUBLISH/SUBSCRIBE is a one-to-many pattern, and it doesn't have acknowledge mechanism because it's not make sence to re-deliver a publish message to a subscribe channel when this channel didn't listen at the time of publish message delivered.

**Return Value**: A &lt;Promise> that is resolved when this channel published message to message broker.



#### channel.subscribe(topic, listener)
* `topic`: &lt;String> - topic name to listen.
* `listener`: &lt;Function> - The callback to handle publish message.

Receive PUBLISH message which matches the `topic` with `listener` callback.

The `listener` is passed with one parameters `(msg)`, where `msg` is a &lt;FastMQ.Message> contains a PUBLISH message.

**Return Value**: A &lt;Promise> that is resolved when this channel published message to message broker.

This method returns current channel object, which can be used as Method Chaining syntax.

**Return Value**: An &lt;FastMQ.Channel> object.

#### channel.getChannels(name[, type])
* `name`: &lt;String> - glob or regular expression to get matched channel
* `type`: &lt;String> - Optional - type of expression, valid types are: `glob` and `regexp`, defaults to `glob`

Retreive list of matched channel names by `name`

> New Method Since `v1.3.0`

**Return Value**: A &lt;Aarray> contains matched channel names

#### channel.watchChannels(name, callback)
* `name`: &lt;String> - glob expression of channel names to be watched
* `callback`: &lt;Function> - callback function when the status of watched channels changed

Watch channels by `name`, and trigger `callback` when status changed.

`callback` contains three arguments:
* `action`: &lt;String> - the action of status changed, possible value are: `add` and `remove`, which respecting to channel joined to / removed from watch scope 
* `channel`: &lt;String> - the changed channel name
* `channels`: &lt;Array> - the list of channels names in current watch scope

The watch scope is settle by `name` expression, and the `callback` will be trigged each time when any channel joined into watch scope or removed from watch scope.

**Return Value**: An &lt;Object> contains `channelPattern` and `channels` attributes.

* `channelPattern`: &lt;String> - The regular expression style expression to represent current watch scope. Can be used as `name` with 'regexp' `type` to call `channel.getChannels` method later.
* `channels`: &lt;Array> - the list of channels names in current watch scope.


Example to watch all channels matching to `'channel.*'` glob expression:
```js
    const info = channel.watchChannels('channel.*', (action, channel, channels) => {
        if (action === 'add') {
            console.log(`Channel <${channel}> joined, count of channels: ${channels.length}`);
        } else {
            console.log(`Channel <${channel}> removed, count of channels: ${channels.length}`);
        }
        console.log('List of channels:' + JSON.stringify(channels));
    });

    console.log(`The expression of watch scope: ${info.channelPattern}`);
    console.log(`List of current watched channels: ${JSON.stringify(info.channels)}`);
```

---
## Class: FastMQ.Message
An abstract class presents variety of messages like REQUEST/RESPONSE/PUSH/PULL/PUBLISH/SUBSCRIBE message.

### message.header
An &lt;Object> contains information of message, the common parameters are listed in the following.
* id: &lt;Number> - unique message id.
* type: &lt;string> - the type of message, possible values: 'req', 'res', 'push', 'pull', 'pub', 'sub'.
* contentType: &lt;string> - the type of payload, possible values: 'json', 'raw', 'string'.
* source: &lt;string> - the source channel name of message, avails on all messages except ack. message.
* target: &lt;string> - the target channel name of message, avails on all messages except ack. message.
* error: &lt;Number> - the response error code, avails on response message.


### message.payload
The message payload, the possible types are &lt;Object>|&lt;Buffer>|&lt;String>, and the type of payload depends on `message.header.contentType`.

### message.setError(code)
* `code`: &lt;Number> - error code

Set error code, please refer [List of Error Codes](#list-of-error-codes)

> This method only avails in response message (message.type === 'res)

### message.isError(value)
* `value`: &lt;Number|String> - error code or error name

Check if the message has error, the `value` can be either error code or error name.

Pleasr [List of Error Codes](#list-of-error-codes) for valid error name and error code.

> This method only avails in response message (message.type === 'res)

**Return Value**: &lt;Boolen>, `true` or `false`

---
## Class: FastMQ.Response
The helper class to send response message back.

### response.send(payload, contentType)
* `payload`: &lt;Object>|&lt;Buffer>|&lt;String> - response payload, the type of this parameter depends on `contentType` parameter.
* `contentType`: &lt;String> - content type of `payload`. Valid values: 'json', 'raw', 'string'.

---
## List of Error Codes
| Name                    | Code | Description                    |
|-------------------------|------|--------------------------------|
| REGISTER_FAIL           | 0x01 | Register channel fail          |
| TARGET_CHANNEL_NONEXIST | 0x02 | Target channel does not existl |
| TOPIC_NONEXIST          | 0x03 | Target topic does not existl   |
| CHANNEL_NONEXIST        | 0x04 | Channel does not exist         |
| INVALID_PARAMETER       | 0x05 | Invliad parameter in payload   |
