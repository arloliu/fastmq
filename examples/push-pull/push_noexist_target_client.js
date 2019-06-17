const FastMQ = process.env.NODE_DEBUG ? require('../../src/index.js') : require('../../lib/index.js');

const serverChannel = 'master';
let pushChannel;
FastMQ.Client.connect('pushChannel', serverChannel)
.then((ch) => {
    pushChannel = ch;
    const data1 = [];
    for (let i = 0; i < 100; i++) {
        data1.push({data: `item${i + 1}`});
    }
    pushChannel.push('noexist_channel', 'testPushPullTopic', data1);
})
.catch((err) => {
    console.log('Got rejection:', err.stack);
});

process.on('SIGINT', () => {
    pushChannel.disconnect();
});
