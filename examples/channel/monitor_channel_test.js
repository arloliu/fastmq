const FastMQ = process.env.NODE_DEBUG ? require('../../src/index.js') : require('../../lib/index.js');

const CHANNEL_COUNT = 100;

async function test() {
    const monitorChannel = await FastMQ.Client.connect(`monitor.#`, 'master');
    const monitorChannel2 = await FastMQ.Client.connect(`monitor2.#`, 'master');

    monitorChannel.watchChannels('channel.*', (action, channel, channels) => {
        console.log(`(1) action: <${action}> channel: ${channel}, len: ${channels.length}`);
    });
    monitorChannel2.watchChannels('channel.*', (action, channel, channels) => {
        console.log(`(2) action: <${action}> channel: ${channel}, len: ${channels.length}`);
    });

    const channels = [];
    for (let i = 0; i < CHANNEL_COUNT; i++) {
        channels[i] = await FastMQ.Client.connect(`channel.${i + 1}.#`, 'master');
    }

    do {
        const ch = channels.pop();
        if (!ch) {
            break;
        }
        await ch.disconnect(true);
    } while (true);

    channels.forEach(async (ch) => {
        await ch.disconnect(true);
    });

    await monitorChannel.disconnect(true);
    await monitorChannel2.disconnect(true);
}

test().catch((err) => {
    console.error(`Monitor channel test got error:`, err.stack);
});
