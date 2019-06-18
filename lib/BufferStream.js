"use strict";

const Int64 = require('node-int64');

class BufferStream {
  constructor(a1) {
    if (typeof a1 === 'number') {
      this._buf = Buffer.allocUnsafe(a1);
    } else if (Buffer.isBuffer(a1)) {
      this._buf = a1;
    } else {
      throw TypeError('BufferStream only accept number or Buffer type as argument');
    }

    this._offset = 0;
    this._size = a1.length;
  }

  get() {
    return this._buf;
  }

  get offset() {
    return this._offset;
  }

  set offset(val) {
    this._offset = val;
  }

  readUInt8() {
    const val = this._buf.readUInt8(this._offset);

    this._offset += 1;
    return val;
  }

  readUInt16BE() {
    const val = this._buf.readUInt16BE(this._offset);

    this._offset += 2;
    return val;
  }

  readUInt32BE() {
    const val = this._buf.readUInt32BE(this._offset);

    this._offset += 4;
    return val;
  }

  readUInt64BE() {
    const val = new Int64(this._buf, this._offset).toNumber();
    this._offset += 8;
    return val;
  }

  readString(length, encoding = 'utf8') {
    const val = this._buf.toString(encoding, this._offset, this._offset + length);

    this._offset += length;
    return val;
  }

  readBuffer(length) {
    const val = this._buf.slice(this._offset, this._offset + length);

    this._offset += length;
    return val;
  }

  writeUInt8(val) {
    this._offset = this._buf.writeUInt8(val, this._offset);
  }

  writeUInt16BE(val) {
    this._offset = this._buf.writeUInt16BE(val, this._offset);
  }

  writeUInt32BE(val) {
    this._offset = this._buf.writeUInt32BE(val, this._offset);
  }

  writeUInt64BE(val) {
    const int64Val = new Int64(val);
    int64Val.copy(this._buf, this._offset);
    this._offset += 8;
  }

  writeString(str, length) {
    const bufLen = length === undefined ? str.length : length;
    this._offset += this._buf.write(str, this._offset, bufLen);
  }

  writeBuffer(buf, start, end) {
    this._offset += buf.copy(this._buf, this._offset, start, end);
  }

  readHeaderString() {
    const len = this.readUInt8();
    return this.readString(len);
  }

  writeHeaderString(str, length) {
    const bufLen = length === undefined ? str.length : length;
    this.writeUInt8(bufLen);
    this.writeString(str, bufLen);
  }

}

module.exports = BufferStream;