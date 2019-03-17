'use strict';
const path = require('path');
const os = require('os');

exports.toNumber = function(x) {
    const value = Number(x);
    return value >= 0 ? x : false;
};
exports.getSocketPath = function(channel) {
    let pipePath = path.resolve(os.tmpdir(), `.fast.mq.${channel}`);

    // use windows named pipe
    if (process.platform === 'win32') {
        pipePath = pipePath.replace(/^\//, '');
        pipePath = pipePath.replace(/\//g, '-');
        pipePath = `\\\\.\\pipe\\${pipePath}`;
    }
    return pipePath;
};

const pid = process && process.pid ? process.pid : 0;
function uuid() {
    const time = Date.now();
    const last = uuid.last || time;
    uuid.last = time > last ? pid + time : pid + last + 1;
    return uuid.last;
}

exports.uuid = uuid;
