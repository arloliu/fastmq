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
const pidStr = pid.toString(36);

function uuid() {
    const time = Date.now();
    /* eslint-disable-next-line no-var */
    var last = uuid.last || time;
    uuid.last = time > last ? pid + time : pid + last + 1;
    return uuid.last;
}

exports.uuid = uuid;


let mac = '';
const networkInterfaces = require('os').networkInterfaces();
/* eslint-disable-next-line guard-for-in */
for (const index in networkInterfaces) {
    const networkInterface = networkInterfaces[index];
    const length = networkInterface.length;
    for (let i = 0; i < length; i++) {
        if (networkInterface[i].mac && networkInterface[i].mac !== '00:00:00:00:00:00') {
            mac = networkInterface[i].mac;
            break;
        }
    }
}
const address = mac ? parseInt(mac.replace(/\:|\D+/gi, '')).toString(36) : '';

function uniqid(prefix) {
    return (prefix || '') + address + pidStr + uuid().toString(36);
}
exports.uniqid = uniqid;
