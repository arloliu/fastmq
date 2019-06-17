const FastMQ = process.env.NODE_DEBUG ? require('../../src/index.js') : require('../../lib/index.js');

FastMQ.Client.connect('', {
    host: '127.0.0.1',
    port: 7500,
})
.then((channel) => {
    console.log('publish client connected, _connected:', channel._connected);
    setInterval(() => {
        console.log('Publish');
        channel.publish('*', 'sub_topic', {data: 'publish test'});
    }, 1000);

    channel.onError((err) => {
        console.error('publish got error:', err);
    });
    // channel.disconnect();
})
.catch((err) => {
    console.log('tcp_req_res_client got error:', err);
    return;
});

