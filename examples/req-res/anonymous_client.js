const FastMQ = require('../../lib/index.js');


async function test() {
    try {
        const reqChannel = await FastMQ.Client.connect(null, 'master');
        const resChannel = await FastMQ.Client.connect(null, 'master');
        const res2Channel = await FastMQ.Client.connect(null, 'master');

        console.log(`request channel name: ${reqChannel.name} response channel name: ${resChannel.name}`);

        resChannel.response('test_json', (req, res) => {
            console.log(`[res1] Got request from ${req.header.source}:`, req.payload);
            const resData = { message: 'response from res_client', request: req.payload };
            res.send(resData, 'json');
        });

        const reqData = { message: 'request from client1' };
        const requestPromises = [];
        for (let i = 0; i < 10; i++) {
            requestPromises.push(reqChannel.request('*', 'test_json', reqData, 'json'));
        }
        await Promise.all(requestPromises);

        console.log('disconnect');
        reqChannel.disconnect();
        resChannel.disconnect();
        process.exit(0);
    } catch (err) {
        console.log('Got error:', err);
        process.exit(1);
    }
}

test();