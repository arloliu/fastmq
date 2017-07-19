'use strict';
const path = require('path');
const os = require('os');

exports.toNumber = function(x) { return (x = Number(x)) >= 0 ? x : false; };
exports.getSocketPath = function(channel)
{
    let pipePath = path.resolve(os.tmpdir(), `.fast.mq.${channel}`);

    // use windows named pipe
    if (process.platform === 'win32')
    {
        pipePath = path.replace(/^\//, '');
        pipePath = path.replace(/\//g, '-');
        pipePath = `\\\\.\\pipe\\${pipePath}`;
    }
    return pipePath;
};

const pid = (process && process.pid) ? process.pid : 0;
function uuid()
{
    var time = Date.now();
    var last = uuid.last || time;
    uuid.last = time > last ? (pid + time) : (pid + last + 1);
    return uuid.last;
}

exports.uuid = uuid;
