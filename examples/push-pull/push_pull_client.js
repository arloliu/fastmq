const FastMQ = process.env.NODE_DEBUG ? require('../../src/index.js') : require('../../lib/index.js');

const serverChannel = 'master';
let pullChannel1;
let pullChannel2;
let pushChannel;
let pushItemsId;

let itemCount = 0;
function pushItems(channel) {
    const data = [];

    for (let i = 0; i < 500; i++) {
        itemCount++;
        data.push({ data: `item${itemCount}` });
    }
    channel.push('pullChannel.*', 'testPushPullTopic', data);
    if (itemCount > 100000) {
        console.log('Finish PUSH');
        if (pushItemsId) {
            clearInterval(pushItemsId);
            pushItemsId = null;
        }

        setTimeout(() => {
            process.emit('SIGINT');
        }, 2000);
    }
}

// const server = new FastMQ.Server(serverChannel);
// server.start()
Promise.resolve()
    .then(() => {
        // console.log('Message broker server started.');
        return FastMQ.Client.connect('pullChannel.#', serverChannel);
    })
    .then((ch) => {
        pullChannel1 = ch;
        console.log('push_client1 connected.');
        return pullChannel1.pull('testPushPullTopic', { prefetch: 10 }, (msg) => {
            console.log(`# pullChannel1, msg.id: ${msg.header.id}, payload:`, msg.payload);
        });
    })
    .then(() => {
        return FastMQ.Client.connect('pullChannel.#', serverChannel);
    })
    .then((ch) => {
        pullChannel2 = ch;
        console.log('push_client2 connected.');
        pullChannel2.pull('testPushPullTopic', { prefetch: 10 }, (msg) => {
            console.log(`# pullChannel2, msg.id: ${msg.header.id}, source: ${msg.header.source} payload:`, msg.payload);
            return Promise.resolve();
        });
    })
    .then(() => {
        return FastMQ.Client.connect('pushChannel.#', serverChannel);
    })
    .then((ch) => {
        pushChannel = ch;
        pushItemsId = setInterval(pushItems, 10, pushChannel);
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
        pushItemsId = null;
    }
    pullChannel1.disconnect();
    pullChannel2.disconnect();
    pushChannel.disconnect();
});
