const FastMQ = require('../../src/index.js');

let reqChannel;
let resChannel;

FastMQ.Client.connect('xxxc', 7500, '127.0.0.1', (err, channel) => {
    console.log('test callback style connect.');
    if (err) {
        console.log('got error:', err);
    }
    channel.disconnect();
});

FastMQ.Client.connect('res_client', 7500, '127.0.0.1')
    .then((channel) => {
        resChannel = channel;
        channel.response('test_json', (req, res) => {
            console.log(`Got request from ${req.header.source}:`, req.payload);
            const resData = { message: 'response from res_client', request: req.payload };
            res.send(resData, 'json');
        });
    })
    .then(() => {
        return FastMQ.Client.connect('req_client', 7500, '127.0.0.1');
    })
    .then((ch) => {
        reqChannel = ch;
        const reqData = { message: 'request from client1'};
        const requestPromises = [];
        for (let i = 0; i < 10; i++) {
            requestPromises.push(reqChannel.request('res_client', 'test_json', reqData, 'json'));
        }
        return Promise.all(requestPromises);
    })
    .then((results) => {
        results.forEach((res) => {
            console.log('Got response from res_client, payload:', res.payload);
        });
    })
    .then(() => {
        return reqChannel.request('non_exist_channel', 'test', {}, 'json').then((res) => {
            if (res.isError('TARGET_CHANNEL_NONEXIST')) {
                console.log('Got error code:TARGET_CHANNEL_NONEXIST');
            }
        });
    })
    .then(() => {
        console.log('disconnect');
        reqChannel.disconnect();
        resChannel.disconnect();
    })
    .catch((err) => {
        console.log('tcp_req_res_client got error:', err);
        return;
    });
