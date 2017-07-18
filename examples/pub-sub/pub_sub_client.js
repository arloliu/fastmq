const Promise = require('bluebird');
const MessageBroker = require('../../lib/index.js');

var subChannel1;
var subChannel2;
var pubChannel1;

MessageBroker.Client.connect('subChannel1', 'master')
.then((ch) => {
    subChannel1 = ch;
    return subChannel1.subscribe('testPubSub', (msg) => {
        console.log(`# subChannel1, msg.id: ${msg.header.id}, payload:`, msg.payload);
    })
})
.then(() => {
    return MessageBroker.Client.connect('subChannel2', 'master');
})
.then((ch) => {
    subChannel2 = ch;
    return subChannel2.subscribe('testPubSub', (msg) => {
        console.log(`# subChannel2, msg.id: ${msg.header.id}, payload:`, msg.payload);
    });
})
.then(() => {
    return MessageBroker.Client.connect('pubChannel1', 'master');
})
.then((ch) => {
    pubChannel1 = ch;
    return pubChannel1.publish('subChannel*', 'testPubSub', {message: 'publish'}, 'json');
})
.then(() => {
    console.log('Published.');
})
.catch((err) => {
    console.log('Got rejection:', err.stack);
});

