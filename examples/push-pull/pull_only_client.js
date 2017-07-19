const FastMQ = require('../../lib/index.js');
const serverChannel = 'master';
var pullChannel;
FastMQ.Client.connect('pullChannel', serverChannel)
.then((ch) => {
    pullChannel = ch;

    pullChannel.pull('testPushPullTopic', {prefetch: 2}, (msg) => {
        console.log(`# pullChannel, msg.id: ${msg.header.id}, payload:`, msg.payload);
        return Promise.resolve();
    });
})
.catch((err) => {
    console.log('Got rejection:', err.stack);
});

process.on('SIGINT', () => {
    pullChannel.disconnect();
});
