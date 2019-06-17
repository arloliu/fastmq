const FastMQ = process.env.NODE_DEBUG ? require('../../src/index.js') : require('../../lib/index.js');

let channel;
const reqData = { num: 1, data: 'test' };
FastMQ.Client.connect('client1', 'master', (err, ch) => {
    channel = ch;
    channel
        .request('master', 'test_cmd_json', reqData, 'json')
        .then((res) => {
            console.log('got test_cmd_json response, payload:', res.payload);
            return channel.request('master', 'test_cmd_raw', Buffer.from([0xff]), 'raw');
        })
        .then((res) => {
            console.log('got test_cmd_raw response, payload:', res.payload);
            return channel.request('master', 'noexist_topic', Buffer.from([0xff]), 'raw');
        })
        .then((res) => {
            if (res.isError('TOPIC_NONEXIST')) {
                console.log('Got TOPIC_NONEXIST error code.');
            }
        })
        .then(() => {
            console.log('disconnect');
            channel.disconnect();
        })
        .catch((error) => {
            console.log('Got rejection, error:', error.stack);
        });
});
