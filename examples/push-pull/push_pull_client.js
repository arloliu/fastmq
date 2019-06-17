const FastMQ = process.env.NODE_DEBUG ? require('../../src/index.js') : require('../../lib/index.js');

const serverChannel = 'master';
let pullChannel1;
let pullChannel2;
let pushChannel;
let pushItemsId;

let itemCount = 0;
function pushItems(channel) {
    const data = [];

    for (let i = 0; i < 1000; i++) {
        itemCount++;
        data.push({ data: `item${itemCount}` });
    }
    channel.push('pullChannel.*', 'testPushPullTopic', data);
    if (itemCount > 10000) {
        process.emit('SIGINT');
    }
}

// const server = new FastMQ.Server(serverChannel);
// server.start()
Promise.resolve()
    .then(() => {
        // console.log('Message broker server started.');
        return FastMQ.Client.connect('pullChannel.1', serverChannel);
    })
    .then((ch) => {
        pullChannel1 = ch;
        console.log('push_client1 connected.');
        return pullChannel1.pull('testPushPullTopic', { prefetch: 2 }, (msg) => {
            console.log(`# pullChannel1, msg.id: ${msg.header.id}, payload:`, msg.payload);
        });
    })
    .then(() => {
        return FastMQ.Client.connect('pullChannel.2', serverChannel);
    })
    .then((ch) => {
        pullChannel2 = ch;
        console.log('push_client2 connected.');
        pullChannel2.pull('testPushPullTopic', { prefetch: 3 }, (msg) => {
            console.log(`# pullChannel2, msg.id: ${msg.header.id}, payload:`, msg.payload);
            return Promise.resolve();
        });
    })
    .then(() => {
        return FastMQ.Client.connect('pushChannel', serverChannel);
    })
    .then((ch) => {
        pushChannel = ch;
        pushItemsId = setInterval(pushItems, 300, pushChannel);
    })
    .catch((err) => {
        console.log('Got rejection:', err.stack);
    });

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, '\n\nReason:', reason);
    // application specific logging, throwing an error, or other logic here
});

process.on('SIGINT', () => {
    console.log('Finished.');
    if (pushItemsId) {
        clearInterval(pushItemsId);
    }
    pullChannel1.disconnect();
    pullChannel2.disconnect();
    pushChannel.disconnect();
});
