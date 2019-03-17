const FastMQ = require('../../lib/index.js');

let subChannel1;
let subChannel2;
let pubChannel1;

async function test() {
    subChannel1 = await FastMQ.Client.connect('subChannel1', 'master');
    subChannel2 = await FastMQ.Client.connect('subChannel2', 'master');
    pubChannel1 = await FastMQ.Client.connect('pubChannel1', 'master');

    subChannel1.subscribe('testPubSub', (msg) => {
        console.log(`# subChannel1, msg.id: ${msg.header.id}, payload:`, msg.payload);
    });
    subChannel2.subscribe('testPubSub', (msg) => {
        console.log(`# subChannel2, msg.id: ${msg.header.id}, payload:`, msg.payload);
    });

    const publishJobs = [];
    for (let i = 0; i < 3; i++) {
        const payload = {
            message: `pulibsh_job_${i + 1}`,
        };
        publishJobs.push(pubChannel1.publish('subChannel*', 'testPubSub', payload, 'json'));
    }

    Promise.all(publishJobs).then((result) => {
        console.log('All published');
    });
}

test();
