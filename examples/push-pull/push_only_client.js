const FastMQ = require('../../lib/index.js');
const serverChannel = 'master';
var pushChannel;
FastMQ.Client.connect('pushChannel', serverChannel)
.then((ch) => {
    pushChannel = ch;
    const data1 = [];
    const data2 = [];
    for (let i = 0; i < 100; i++)
    {
        data1.push({data: `item${i + 1}`});
    }
    for (let i = 100; i < 200; i++)
    {
        data2.push({data: `item${i + 1}`});
    }
    pushChannel.push('pullChannel', 'testPushPullTopic', data1);
    return pushChannel.push('pullChannel', 'testPushPullTopic', data2);
})
.then(() => {
    console.log('Push 200 items to pullChannel:testPushPullTopic');
    pushChannel.disconnect();
})
.catch((err) => {
    console.log('Got rejection:', err.stack);
});
