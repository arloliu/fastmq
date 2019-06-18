const FastMQ = process.env.NODE_DEBUG ? require('../../src/index.js') : require('../../lib/index.js');
const assert = require('assert');
let reqChannel;
let resChannel;

const reqData = {};

for (let i = 0; i < 10000; i++) {
    reqData[`field${i + 1}`] = `VERY loooooooooooooooooooooooooooooooooooooooooooooooooooong data ${i + 1}`;
}

FastMQ.Client.connect('res_client', 'master')
    .then((channel) => {
        resChannel = channel;
        channel.response('test_json', (req, res) => {
            console.log(`Got request from ${req.header.source}:`);
            const resData = { message: 'response from res_client', request: req.payload };
            res.send(resData, 'json');
        });
    })
    .then(() => {
        return FastMQ.Client.connect('req_client', 'master');
    })
    .then((ch) => {
        reqChannel = ch;
        const requestPromises = [];
        for (let i = 0; i < 50; i++) {
            requestPromises.push(reqChannel.request('res_client', 'test_json', reqData, 'json'));
        }
        return Promise.all(requestPromises);
    })
    .then((results) => {
        results.forEach((res) => {
            console.log('Got response from res_client');
            assert.deepEqual(res.payload.request, reqData);
        });
    })
    .then(() => {
        console.log('disconnect');
        reqChannel.disconnect(true);
        resChannel.disconnect(true);
    });
