const FastMQ = process.env.NODE_DEBUG ? require('../../src/index.js') : require('../../lib/index.js');


async function main() {
    const reqChannel = await FastMQ.Client.connect('test_req_channel', 7500, '127.0.0.1');
    const resChannel = await FastMQ.Client.connect('test_res_channel', 7500, '127.0.0.1');

    resChannel.response('async_topic', async (req) => {
        const data = {
            message: 'response from res_client',
            payload: req.payload,
        };
        return data;
    });

    const reqTasks = [];
    for (let i = 0; i < 100; i++) {
        const task = reqChannel.request('test_res_channel', 'async_topic', {data: `reqeust ${i + 1}`});
        reqTasks.push(task);
    }

    const results = await Promise.all(reqTasks);
    results.forEach((res) => {
        console.log('Got response from res_client, payload:', res.payload);
    });

    reqChannel.disconnect(true);
    resChannel.disconnect(true);
}

main();
