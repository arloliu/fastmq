const FastMQ = process.env.NODE_DEBUG ? require('../../src/index.js') : require('../../lib/index.js');
const assert = require('assert');

const CHANNEL_COUNT = 100;

async function test() {
    const monitorChannel = await FastMQ.Client.connect(`monitor.#`, 'master');
    const channels = [];

    for (let i = 0; i < CHANNEL_COUNT; i++) {
        channels[i] = await FastMQ.Client.connect(`channel.${i + 1}.#`, 'master');
    }

    const channelNames = await monitorChannel.getChannels('channel.*');
    console.log(`Channels: `, channelNames);
    assert.equal(channelNames.length, CHANNEL_COUNT);

    let i = CHANNEL_COUNT;
    do {
        const ch = channels.pop();
        if (!ch) {
            break;
        }
        await ch.disconnect(true);
        i--;
        const channelNames2 = await monitorChannel.getChannels('channel.*');
        assert.equal(channelNames2.length, i);
    } while (true);

    channels.forEach(async (ch) => {
        await ch.disconnect(true);
    });

    await monitorChannel.disconnect(true);
}

test().catch((err) => {
    console.error(`Channel test got error:`, err.stack);
});
