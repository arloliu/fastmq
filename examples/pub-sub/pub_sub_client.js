const FastMQ = require('../../lib/index.js');

let subChannel1;
let subChannel2;
let pubChannel1;

async function test() {
    subChannel1 = await FastMQ.Client.connect('subChannel.#', 'master');
    subChannel2 = await FastMQ.Client.connect('subChannel.#', 'master');
    pubChannel1 = await FastMQ.Client.connect('pubChannel1', 'master');

    subChannel1.subscribe('testPubSub', (msg) => {
        console.log(`# ${subChannel1.name}, msg.id: ${msg.header.id}, payload:`, msg.payload);
    });
    subChannel2.subscribe('testPubSub', (msg) => {
        console.log(`# ${subChannel2.name}, msg.id: ${msg.header.id}, payload:`, msg.payload);
    });

    const publishJobs1 = [];
    const publishJobs2 = [];
    for (let i = 0; i < 10; i++) {
        const payload = {
            message: `pulibsh_job_${i + 1}`,
        };
        publishJobs1.push(pubChannel1.publish('subChannel*', 'testPubSub', payload, 'json'));
    }

    // register in middle
    const subChannel3 = await FastMQ.Client.connect('subChannel3.#', 'master');
    console.log('Register channel:', subChannel3.name);
    subChannel3.subscribe('testPubSub', (msg) => {
        console.log(`# ${subChannel3.name}, msg.id: ${msg.header.id}, payload:`, msg.payload);
    });

    for (let i = 10; i < 20; i++) {
        const payload = {
            message: `pulibsh_job_${i + 1}`,
        };
        publishJobs2.push(pubChannel1.publish('subChannel*', 'testPubSub', payload, 'json'));
    }
    Promise.all(publishJobs1).then(() => {
        return Promise.all(publishJobs2);
    })
    .then((result) => {
        console.log('All published');
    });
}

test();
