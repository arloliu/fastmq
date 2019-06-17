const FastMQ = process.env.NODE_DEBUG ? require('../../src/index.js') : require('../../lib/index.js');

let subChannel1;
let subChannel2;
let pubChannel1;

async function test() {
    subChannel1 = await FastMQ.Client.connect('subChannel1.#', 'master');
    subChannel2 = await FastMQ.Client.connect('subChannel2.#', 'master');
    pubChannel1 = await FastMQ.Client.connect('pubChannel1', 'master');

    subChannel1.subscribe('testPubSub', (msg) => {
        console.log(`# ${subChannel1.name}, msg.id: ${msg.header.id}, payload:`, msg.payload);
        const message = msg.payload.message;
        if (message < 1 || message > 30) {
            throw new Error('subChannel1 subscribe invalid');
        }
    });
    subChannel2.subscribe('testPubSub', (msg) => {
        console.log(`# ${subChannel2.name}, msg.id: ${msg.header.id}, payload:`, msg.payload);
        const message = msg.payload.message;
        if (message > 20 && message <= 30) {
            throw new Error('subChannel2 subscribe invalid');
        }
    });

    const publishJobs1 = [];
    const publishJobs2 = [];
    const publishJobs3 = [];

    for (let i = 0; i < 10; i++) {
        const payload = {
            message: (i + 1),
        };
        publishJobs1.push(pubChannel1.publish('subChannel*', 'testPubSub', payload, 'json'));
    }
    await Promise.all(publishJobs1);

    // register in middle
    const subChannel3 = await FastMQ.Client.connect('subChannel3.#', 'master');
    console.log('Register channel:', subChannel3.name);
    subChannel3.subscribe('testPubSub', (msg) => {
        console.log(`# ${subChannel3.name}, msg.id: ${msg.header.id}, payload:`, msg.payload);
        const message = msg.payload.message;
        if (message <= 10) {
            throw new Error('subChannel3 subscribe invalid');
        }
    });

    for (let i = 10; i < 20; i++) {
        const payload = {
            message: (i + 1),
        };
        publishJobs2.push(pubChannel1.publish('subChannel*', 'testPubSub', payload, 'json'));
    }
    await Promise.all(publishJobs2);

    console.log('Disconnect channel:', subChannel2.name);
    // remove subChannel2
    await subChannel2.disconnect(true);

    for (let i = 20; i < 30; i++) {
        const payload = {
            message: (i + 1),
        };
        publishJobs3.push(pubChannel1.publish('subChannel*', 'testPubSub', payload, 'json'));
    }
    await Promise.all(publishJobs3);
}

test().catch((err) => {
    console.error('Error:', err.message);
});
