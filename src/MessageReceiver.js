'use strict';
const Message = require('./Message.js');
const EventEmitter = require('eventemitter3');

class MessageReceiver extends EventEmitter {
    constructor(messageHandler) {
        super();
        this._recvBytes = 0;
        this._expectMsgSize = 0;
        this._recvBuf = null;
        this._messageHandler = messageHandler;
    }

    recv(chunk, socket) {
        let reminingBytes = chunk.length;
        let chunkOffset = 0;

        try {
            while (reminingBytes > 0) {
                if (this._recvBytes === 0) {
                    // read message length
                    this._expectMsgSize = chunk.readUInt32BE(chunkOffset);
                    this._recvBuf = Buffer.allocUnsafe(this._expectMsgSize);

                    const sourceEnd = reminingBytes > this._expectMsgSize ? this._expectMsgSize : reminingBytes;
                    chunk.copy(this._recvBuf, 0, chunkOffset, chunkOffset + sourceEnd);
                    this._recvBytes += sourceEnd;
                    chunkOffset += sourceEnd;
                    reminingBytes -= sourceEnd;
                } else if (this._recvBytes < this._expectMsgSize) {
                    const msgReminingBytes = this._expectMsgSize - this._recvBytes;
                    const sourceEnd = reminingBytes > msgReminingBytes ? msgReminingBytes : reminingBytes;
                    chunk.copy(this._recvBuf, this._recvBytes, chunkOffset, chunkOffset + sourceEnd);
                    this._recvBytes += sourceEnd;
                    chunkOffset += sourceEnd;
                    reminingBytes -= sourceEnd;
                }

                if (this._recvBytes >= this._expectMsgSize) {
                    this._recvBytes -= this._expectMsgSize;
                    this._expectMsgSize = 0;

                    const msg = Message.createFromBuffer(this._recvBuf);

                    this._messageHandler(msg, this._recvBuf, socket);
                }
            }
        } catch (err) {
            this.emit('error', err);
        }
    }
}

module.exports = MessageReceiver;
