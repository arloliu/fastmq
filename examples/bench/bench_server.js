const FastMQ = require('../../lib/index.js');

const server = FastMQ.Server.create('master');

server.response('test_cmd_json', (msg, res) => {
    const resData = { num: msg.payload.num + 1 };
    res.send(resData, 'json');
});

server.response('test_cmd_raw', (msg, res) => {
    const resData = Buffer.from(msg.payload);
    res.send(resData, 'raw');
});

server.start();

process.on('SIGINT', () => {
    server.stop();
});
