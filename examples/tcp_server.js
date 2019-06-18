const FastMQ = process.env.NODE_DEBUG ? require('../src/index.js') : require('../lib/index.js');

const server = FastMQ.Server.create('master', 7500);

server.response('test_cmd_json', (msg, res) => {
    const resData = { num: msg.payload.num + 1 };
    res.send(resData, 'json');
});

server.response('test_cmd_raw', (msg, res) => {
    const resData = Buffer.from(msg.payload);
    res.send(resData, 'raw');
});

server.start().then(() => {
    console.log('Message Broker server started');
});

process.on('SIGINT', () => {
    console.log('Got SIGINT');
    server.stop();
});
