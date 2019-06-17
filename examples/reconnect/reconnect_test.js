const FastMQ = process.env.NODE_DEBUG ? require('../../src/index.js') : require('../../lib/index.js');

FastMQ.Client.connect('', {
    host: '127.0.0.1',
    port: 7500,
})
.then((channel) => {
    console.log('client connected');
    channel.subscribe('sub_topic', (msg) => {
        console.log('sub_topic msg:', msg);
    });
    channel.subscribe('sub_topic2', (msg) => {
        console.log('sub_topic2 msg:', msg);
    });
    channel.onError((err) => {
        console.error('Client got error:', err.message);
    });
    channel.onReconnect(() => {
        console.error('Client reconnected');
    });
})
.catch((err) => {
    console.log('reconnect_test got error:', err);
    return;
});

