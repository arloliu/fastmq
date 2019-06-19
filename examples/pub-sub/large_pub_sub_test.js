const FastMQ = process.env.NODE_DEBUG ? require('../../src/index.js') : require('../../lib/index.js');
const _ = require('lodash');
const assert = require('assert');
const path = require('path');

const argv = require('minimist')(process.argv.slice(2), {
    alias: {
        's': 'sub_ch',
        'p': 'pub_ch',
        'l': 'loop',
        't': 'tcp',
        'm': 'msg_count',
        'f': 'forever',
        'h': 'help',
    },
    boolean: ['tcp', 'forever', 'help'],
    default: {
        'sub_ch': 100,
        'pub_ch': 10,
        'loop': 200,
        'tcp': false,
        'msg_count': 10,
        'forever': false,
        'help': false,
    },
});

if (argv.help) {
    console.log(`Usage: ${path.basename(process.argv[1])} -s|--sub_ch -p|--pub_ch -l|--loop -t|--tcp -m|--MSG_COUNT -f|--forever -h|--help`);
    process.exit(0);
}

const SUB_CHANNEL_COUNT = argv.sub_ch;
const PUB_CHANNEL_COUNT = argv.pub_ch;
const LOOP_COUNT = argv.loop;
const MSG_COUNT = argv.msg_count;
const TOTAL_COUNT = (SUB_CHANNEL_COUNT * LOOP_COUNT * PUB_CHANNEL_COUNT);
const PubMessages = [];

let totalPubMsgBytes = 0;
for (let ch = 0; ch < PUB_CHANNEL_COUNT; ch++) {
    const msg = {};
    for (let i = 0; i < MSG_COUNT; i++) {
        msg[`f${i}`] = `field data ${_.random(100, 10000000, false)}`;
    }
    totalPubMsgBytes += Buffer.byteLength(JSON.stringify(msg));
    PubMessages.push(msg);
}

console.log(`Large scale publish/subscribe test
* Publish Channels: ${PUB_CHANNEL_COUNT}
* Subscribe Channels: ${SUB_CHANNEL_COUNT}
* Iterations: ${LOOP_COUNT}
* Avg. Message bytes: ${Number.parseFloat(totalPubMsgBytes / PUB_CHANNEL_COUNT).toFixed(0)} bytes
* TCP mode: ${argv.tcp}
* Forever mode: ${argv.forever}
`);

const subChannels = [];
const pubChannels = [];
let timer;
let foreverCounter = 0;
let elasped;
let elaspedTimer;

async function test() {
    let subCount = 0;

    const subHandler = (msg) => {
        const {from, message} = msg.payload;
        // console.log(`subscribe chhanel <${channel.name} recv. from:${from} loop:${loop}`);
        assert.deepEqual(PubMessages[from], message);
        subCount++;

        if (!argv.forever && subCount >= TOTAL_COUNT) {
            console.log(`All finished.`);
            subChannels.forEach(async (channel) => {
                await channel.disconnect(true);
            });
            pubChannels.forEach(async (channel) => {
                await channel.disconnect(true);
            });
        }

        if (argv.forever) {
            foreverCounter++;
        }
    };

    const errorHandler = (err) => {
        console.error('Got error:', err.stack);
    };


    const connectOption = argv.tcp ? {
        host: 'localhost',
        port: 7500,
        reconnect: false,
    } : { path: 'master', reconnect: false };

    const pubTargetChannelPrefix = `subChannel.${_.random(1000, 10000)}`;
    const subChannelName = `${pubTargetChannelPrefix}.#`;
    console.log('Channel connecting.');
    try {
        for (let i = 0; i < SUB_CHANNEL_COUNT; i++) {
            const channel = await FastMQ.Client.connect(subChannelName, connectOption);
            channel.onError(errorHandler);
            subChannels.push(channel);

            channel.subscribe('testTopic', subHandler);
        }
        for (let i = 0; i < PUB_CHANNEL_COUNT; i++) {
            const channel = await FastMQ.Client.connect('pubChannel.#', connectOption);
            channel.onError(errorHandler);
            pubChannels.push(channel);
        }
    } catch (err) {
        console.error('Client connection error:', err.message);
        process.exit(1);
    }

    console.log('Start tests.');
    if (argv.forever) {
        timer = setInterval(() => {
            for (let ch = 0; ch < PUB_CHANNEL_COUNT; ch++) {
                const payload = {
                    from: ch,
                    loop: 0,
                    message: PubMessages[ch],
                };
                pubChannels[ch].publish(`${pubTargetChannelPrefix}.*`, 'testTopic', payload, 'json');
            }
        }, 10);

        elasped = Date.now();
        elaspedTimer = setInterval(() => {
            const currentMs = Date.now();
            const elapsedMs = currentMs - elasped;
            elasped = currentMs;
            const ops = Number.parseFloat(foreverCounter * 1000 / elapsedMs).toFixed(1);
            console.log(`Receive subscribe message: ${ops} operations/sec.`);
            foreverCounter = 0;
        }, 1000);
    } else {
        const publishJobs = [];
        for (let i = 0; i < LOOP_COUNT; i++) {
            for (let ch = 0; ch < PUB_CHANNEL_COUNT; ch++) {
                const payload = {
                    from: ch,
                    loop: i,
                    message: PubMessages[ch],
                };
                publishJobs.push(pubChannels[ch].publish('subChannel.*', 'testTopic', payload, 'json'));
            }
        }
        await Promise.all(publishJobs);
    }
}

test().catch((err) => {
    console.error('Error:', err.message);
});

process.on('SIGINT', () => {
    console.log('Stop test');
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    if (elaspedTimer) {
        clearInterval(elaspedTimer);
        elaspedTimer = null;
    }

    subChannels.forEach(async (channel) => {
        await channel.disconnect(true);
    });
    pubChannels.forEach(async (channel) => {
        await channel.disconnect(true);
    });
});
