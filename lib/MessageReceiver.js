'use strict';

const Message = require('./Message.js');

const EventEmitter = require('eventemitter3');

const debug = require('util').debuglog('fastmq.recv');

class MessageReceiver extends EventEmitter {
  constructor(messageHandler) {
    super();
    this._recvPool = new WeakMap();
    this._messageHandler = messageHandler;
  }

  _callHanlder(buf, socket) {
    const msg = Message.createFromBuffer(buf);

    this._messageHandler(msg, buf, socket);
  }

  _processChunk(buf, socket) {
    let remainingBytes = buf.length;
    let offset = 0;

    do {
      if (remainingBytes < 4) {
        return remainingBytes;
      }

      const expectMsgSize = buf.readUInt32BE(offset);
      debug("_processChunk fd(".concat(socket._handle.fd, ") offset:").concat(offset, " expectMsgSize:").concat(expectMsgSize, " remainingBytes:").concat(remainingBytes));

      if (remainingBytes >= expectMsgSize) {
        const recvBuf = buf.slice(offset, offset + expectMsgSize);

        this._callHanlder(recvBuf, socket);

        remainingBytes -= expectMsgSize;
        offset += expectMsgSize;

        if (remainingBytes === 0) {
          return 0;
        }
      } else {
        return remainingBytes;
      }
    } while (true);
  }

  _recvNewChunk(chunk, socket) {
    const expectMsgSize = chunk.readUInt32BE(0);

    if (chunk.length === expectMsgSize) {
      debug("# Recv. chunk.length === expectMsgSize, direct pass ".concat(chunk.length, ":").concat(expectMsgSize));

      this._callHanlder(chunk, socket);

      return;
    } else if (chunk.length < expectMsgSize) {
      debug("# Recv. chunk.length < expectMsgSize ".concat(chunk.length, ":").concat(expectMsgSize));
      const recvBuf = Buffer.allocUnsafe(chunk.length);
      chunk.copy(recvBuf);

      this._recvPool.set(socket, recvBuf);

      return;
    } else if (chunk.length > expectMsgSize) {
      debug("# Recv. chunk.length > expectMsgSize ".concat(chunk.length, ":").concat(expectMsgSize));

      const remainingBytes = this._processChunk(chunk, socket);

      if (remainingBytes > 0) {
        const recvBuf = Buffer.allocUnsafe(remainingBytes);
        chunk.copy(recvBuf, 0, chunk.length - remainingBytes, chunk.length);

        this._recvPool.set(socket, recvBuf);
      }
    }
  }

  _recvExistChunk(chunk, socket) {
    const existBuf = this._recvPool.get(socket);

    const recvBuf = Buffer.concat([existBuf, chunk], existBuf.length + chunk.length);
    const expectMsgSize = recvBuf.readUInt32BE(0);

    if (recvBuf.length === expectMsgSize) {
      debug("# Recv. (POOL) fd(".concat(socket._handle.fd, ") chunk.length === expectMsgSize ").concat(recvBuf.length, ":").concat(expectMsgSize));

      this._callHanlder(recvBuf, socket);

      this._recvPool.delete(socket);

      return;
    } else if (recvBuf.length < expectMsgSize) {
      debug("# Recv. (POOL) fd(".concat(socket._handle.fd, ") chunk.length < expectMsgSize ").concat(recvBuf.length, ":").concat(expectMsgSize));

      this._recvPool.set(socket, recvBuf);

      return;
    } else if (recvBuf.length > expectMsgSize) {
      const remainingBytes = this._processChunk(recvBuf, socket);

      debug("# Recv. (POOL) fd(".concat(socket._handle.fd, ") chunk.length > expectMsgSize ").concat(recvBuf.length, ":").concat(expectMsgSize, " remainingBytes: ").concat(remainingBytes));

      if (remainingBytes > 0) {
        debug("## slice recvBuf from ".concat(recvBuf.length - remainingBytes, " to ").concat(recvBuf.length));
        const restBuf = recvBuf.slice(recvBuf.length - remainingBytes, recvBuf.length);

        this._recvPool.set(socket, restBuf);
      } else {
        this._recvPool.delete(socket);
      }
    }
  }

  recv(chunk, socket) {
    try {
      if (!this._recvPool.has(socket)) {
        this._recvNewChunk(chunk, socket);
      } else {
        this._recvExistChunk(chunk, socket);
      }
    } catch (err) {
      this.emit('error', err);
    }
  }

  removeSocket(socket) {
    if (this._recvPool.has(socket)) {
      this._recvPool.delete(socket);
    }
  }

}

module.exports = MessageReceiver;