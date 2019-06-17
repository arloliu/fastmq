module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 15);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Int64 = __webpack_require__(1);

const generateUuid = __webpack_require__(3).uuid;

const BufferStream = __webpack_require__(6);

const ErrorCode = __webpack_require__(4);

const MSG_TYPE = {
  req: 1,
  res: 2,
  push: 3,
  pull: 4,
  pub: 5,
  sub: 6,
  ack: 7,
  mon: 0xf0,
  sreq: 0xff
};
const MSG_CONTENT_TYPE = {
  raw: 1,
  json: 2,
  str: 3
};
/*
Message {
    length:      uint32, 4 bytes, Total length of message, includes Header
    headerLength: uint32, 4 bytes, length of header
    header:       <Header Object>, <headerLength> bytes
    payload:      payload message, <length - headerLength> bytes, the format of body depends on header.contentTtype
}
MessageType {
    req: 1,
    res: 2,
    push: 3,
    pull: 4,
    pub: 5,
    sub: 6,
    ack: 7,
    smon: 0xf0,
    sreq: 0xff,
}

ContentType {
    raw: 1,
    json: 2,
    string: 3
}

RequestHeader & ResponseHeader {
    id:          uint64, unique message id
    type:        uint8, message type, valid value: <MessageType>
    contentType: uint8, Number, valid value: <ContentType>
    error:       uint8, Number, error code, only used in response header
    topicLen:    uint8, topic length
    topic:       <topicLen> bytes, string, message topic
    sourceLen:   uint8, source length
    source:      <sourceLen> bytes, string, source channel's name
    targetLen:   uint8, source length
    target:      <targetLen> bytes, string, target channel's name
}

PublishHeader {
    id:          uint64, unique message id
    type:        uint8, message type, valid value: <MessageType>
    contentType: uint8, Number, valid value: <ContentType>
    topicLen:    uint8, topic length
    topic:       <topicLen> bytes, string, message topic
    targetLen:   uint8, source length
    target:      <targetLen> bytes, string, target channel's name
}

SubscribeHeader {
    id:          uint64, unique message id
    type:        uint8, message type, valid value: <MessageType>
    contentType: uint8, Number, valid value: <ContentType>
    topicLen:    uint8, topic length
    topic:       <topicLen> bytes, string, message topic
}

PushHeader {
    id:          uint64, unique message id
    type:        uint8, message type, valid value: <MessageType>
    contentType: uint8, Number, valid value: <ContentType>
    topicLen:    uint8, topic length
    topic:       <topicLen> bytes, string, message topic
    targetLen:   uint8, source length
    target:      <targetLen> bytes, string, target channel's name
    itemCount:   uint32, number of items in payload
}

PullHeader {
    id:          uint64, unique message id
    type:        uint8, message type, valid value: <MessageType>
    contentType: uint8, Number, valid value: <ContentType>
    topicLen:    uint8, topic length
    topic:       <topicLen> bytes, string, message topic
}

AckHeader {
    id:          uint64, message id of PullHeader.id
    type:        uint8, message type, valid value: <MessageType>
    topicLen:    uint8, topic length
    topic:       <topicLen> bytes, string, message topic
}

MonitorHeader {
    id:          uint64, unique message id
    type:        uint8, message type, valid value: <MessageType>
    contentType: uint8, Number, valid value: <ContentType>
}


PushPayloadItem {
    length: uint32, item length
    item: binary, depends PushHeader.contentType
}
*/

function isIterable(obj) {
  if (obj === null || obj === undefined) {
    return false;
  }

  return typeof obj[Symbol.iterator] === 'function';
}

function getMessageTypeKey(val) {
  for (const key in MSG_TYPE) {
    if (val === MSG_TYPE[key]) {
      return key;
    }
  }

  return null;
}

function getContentType(type) {
  let contentType;

  switch (type) {
    case 1:
      contentType = 'raw';
      break;

    case 2:
      contentType = 'json';
      break;

    case 3:
      contentType = 'string';
      break;

    default:
      contentType = '';
      break;
  }

  return contentType;
}

function checkType(type) {
  return MSG_TYPE[type] ? true : false;
}

function checkContentType(type) {
  return MSG_CONTENT_TYPE[type] ? true : false;
}

function parsePayloadBuffer(payloadBuf, contentType) {
  if (contentType === 'raw') {
    return payloadBuf;
  } else if (contentType === 'json') {
    if (payloadBuf.length === 0) {
      return null;
    }

    return JSON.parse(payloadBuf.toString('utf8'));
  } else {
    return payloadBuf.toString('utf8');
  }
}

class Message {
  constructor(type, id, msgLen, headerLen) {
    // public properties
    this.messageLength = msgLen ? msgLen : 0;
    this.headerLength = headerLen ? headerLen : 0;
    this.header = {
      id: id ? id : generateUuid()
    };
    this.payload = undefined;
    this.payloadBuf = undefined;

    if (type) {
      this.setType(type);
    }
  }

  isRequest() {
    return this.header.type === 'req';
  }

  isServerRequest() {
    return this.header.type === 'sreq';
  }

  isResponse() {
    return this.header.type === 'res';
  }

  isPush() {
    return this.header.type === 'push';
  }

  isPull() {
    return this.header.type === 'pull';
  }

  isPublish() {
    return this.header.type === 'pub';
  }

  isSubscribe() {
    return this.header.type === 'sub';
  }

  isAck() {
    return this.header.type === 'ack';
  }

  isMonitor() {
    return this.header.type === 'mon';
  }

  getEventName() {
    return this.header.topic + '.' + this.header.id;
  }

  setType(type) {
    if (!checkType(type)) {
      throw new TypeError('Invalid message type: ' + type);
    }

    this.header.type = type;
  }

  setContentType(type) {
    if (!checkContentType(type)) {
      throw new TypeError('Invalid message content type: ' + type);
    }

    this.header.contentType = type;
  }

  setPayload(data, contentType) {
    if (contentType) {
      this.header.contentType = contentType;
    }

    this.payload = data;
  }

  setPayloadBuf(buf) {
    this.payloadBuf = buf;
  }

  getBuffer() {
    const headerBuf = this._getHeaderBuffer();

    this.headerLength = headerBuf.length;
    this.messageLength = 8 + this.headerLength;

    if (!this.payloadBuf && this.payload) {
      this.payloadBuf = this._getPayloadBuffer();
    }

    if (this.payloadBuf) {
      this.messageLength += this.payloadBuf.length;
    }

    const msgBuf = Buffer.allocUnsafe(this.messageLength);
    msgBuf.writeUInt32BE(this.messageLength);
    msgBuf.writeUInt32BE(this.headerLength, 4); // copy header to message buffer

    headerBuf.copy(msgBuf, 8); // copy payload to message buffer

    if (this.payloadBuf) {
      this.payloadBuf.copy(msgBuf, 8 + this.headerLength);
    }

    return msgBuf;
  }

  _getPayloadBuffer() {
    const payload = this.payload;
    const contentType = this.header.contentType;
    let payloadBuf;

    if (!checkContentType(contentType)) {
      throw new TypeError('Unknown payload content type: ' + contentType);
    }

    if (contentType === 'raw') {
      payloadBuf = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
    } else if (contentType === 'json') {
      payloadBuf = Buffer.from(JSON.stringify(payload), 'utf8');
    } else if (contentType === 'string') {
      payloadBuf = Buffer.from(payload);
    }

    return payloadBuf;
  }

}

class RequestMessage extends Message {
  constructor(id, msgLen, headerLen, type) {
    super(type ? type : 'req', id, msgLen, headerLen);
  }

  createFromBuffer(buf) {
    const headerBuf = buf.slice(8, 8 + this.headerLength);
    const headerBufStream = new BufferStream(headerBuf);
    headerBufStream.offset = 9;
    this.header.contentType = getContentType(headerBufStream.readUInt8());
    this.header.error = headerBufStream.readUInt8();
    this.header.topic = headerBufStream.readHeaderString();
    this.header.source = headerBufStream.readHeaderString();
    this.header.target = headerBufStream.readHeaderString();
    this.payloadBuf = buf.slice(8 + this.headerLength, this.messageLength);
    this.payload = parsePayloadBuffer(this.payloadBuf, this.header.contentType);
    return this;
  }

  _getHeaderBuffer() {
    const header = this.header;
    const topicLen = Buffer.byteLength(header.topic, 'utf8');
    const sourceLen = Buffer.byteLength(header.source, 'utf8');
    const targetLen = Buffer.byteLength(header.target, 'utf8');
    const headerLen = 14 + topicLen + sourceLen + targetLen;
    const headerBuf = Buffer.alloc(headerLen);
    const bufStream = new BufferStream(headerBuf);
    bufStream.writeUInt64BE(header.id);
    bufStream.writeUInt8(MSG_TYPE[header.type]);
    bufStream.writeUInt8(MSG_CONTENT_TYPE[header.contentType]);
    bufStream.writeUInt8(header.error || 0);
    bufStream.writeHeaderString(header.topic, topicLen);
    bufStream.writeHeaderString(header.source, sourceLen);
    bufStream.writeHeaderString(header.target, targetLen);
    return bufStream.get();
  } // helper methods


  setTopic(topic) {
    this.header.topic = topic;
  }

  setSource(source) {
    this.header.source = source;
  }

  setTarget(target) {
    this.header.target = target;
  }

}

class ServerRequestMessage extends RequestMessage {
  constructor(id, msgLen, headerLen) {
    super(id, msgLen, headerLen, 'sreq');
  }

}

class ResponseMessage extends RequestMessage {
  constructor(id, msgLen, headerLen) {
    super(id, msgLen, headerLen, 'res'); // this.header.type = 'res';
  }

  isError(value) {
    const errCode = typeof value === 'string' ? ErrorCode[value] : code;

    if (errCode === undefined) {
      return false;
    }

    return this.header.error === errCode;
  }

  setError(code) {
    if (typeof code !== 'number') {
      throw new TypeError('Invalid message error code: ' + code);
    }

    this.header.error = code;
  }

}

class PublishMessage extends Message {
  constructor(id, msgLen, headerLen) {
    super('pub', id, msgLen, headerLen);
  }

  createFromBuffer(buf) {
    const headerBuf = buf.slice(8, 8 + this.headerLength);
    const headerBufStream = new BufferStream(headerBuf);
    headerBufStream.offset = 9;
    this.header.contentType = getContentType(headerBufStream.readUInt8());
    this.header.topic = headerBufStream.readHeaderString();
    this.header.target = headerBufStream.readHeaderString();
    this.payloadBuf = buf.slice(8 + this.headerLength, this.messageLength); // this.payload = parsePayloadBuffer(this.payloadBuf, this.header.contentType);

    return this;
  }

  _getHeaderBuffer() {
    const header = this.header;
    const topicLen = Buffer.byteLength(header.topic, 'utf8');
    const targetLen = Buffer.byteLength(header.target, 'utf8');
    const headerLen = 12 + topicLen + targetLen;
    const headerBuf = Buffer.alloc(headerLen);
    const bufStream = new BufferStream(headerBuf);
    bufStream.writeUInt64BE(header.id);
    bufStream.writeUInt8(MSG_TYPE[header.type]);
    bufStream.writeUInt8(MSG_CONTENT_TYPE[header.contentType]);
    bufStream.writeHeaderString(header.topic, topicLen);
    bufStream.writeHeaderString(header.target, targetLen);
    return bufStream.get();
  }

  setTopic(topic) {
    this.header.topic = topic;
  }

  setTarget(target) {
    this.header.target = target;
  }

}

class SubscribeMessage extends Message {
  constructor(id, msgLen, headerLen) {
    super('sub', id, msgLen, headerLen);
  }

  createFromBuffer(buf) {
    const headerBuf = buf.slice(8, 8 + this.headerLength);
    const headerBufStream = new BufferStream(headerBuf);
    headerBufStream.offset = 9;
    this.header.contentType = getContentType(headerBufStream.readUInt8());
    this.header.topic = headerBufStream.readHeaderString();
    this.payloadBuf = buf.slice(8 + this.headerLength, this.messageLength);
    this.payload = parsePayloadBuffer(this.payloadBuf, this.header.contentType);
    return this;
  }

  _getHeaderBuffer() {
    const header = this.header;
    const topicLen = Buffer.byteLength(header.topic, 'utf8');
    const headerLen = 11 + topicLen;
    const headerBuf = Buffer.alloc(headerLen);
    const bufStream = new BufferStream(headerBuf);
    bufStream.writeUInt64BE(header.id);
    bufStream.writeUInt8(MSG_TYPE[header.type]);
    bufStream.writeUInt8(MSG_CONTENT_TYPE[header.contentType]);
    bufStream.writeHeaderString(header.topic, topicLen);
    return bufStream.get();
  }

  setTopic(topic) {
    this.header.topic = topic;
  }

}

class PushMessage extends Message {
  constructor(id, msgLen, headerLen) {
    super('push', id, msgLen, headerLen);
    this.payload = [];
    this.items = [];
  }

  createFromBuffer(buf) {
    const headerBuf = buf.slice(8, 8 + this.headerLength);
    const headerBufStream = new BufferStream(headerBuf);
    headerBufStream.offset = 9;
    this.header.contentType = getContentType(headerBufStream.readUInt8());
    this.header.topic = headerBufStream.readHeaderString();
    this.header.target = headerBufStream.readHeaderString();
    this.header.itemCount = headerBufStream.readUInt32BE();
    const payloadBuf = buf.slice(8 + this.headerLength, this.messageLength); // No need to parse payload
    // this._parsePayloadBuffer(payloadBuf, this.header.contentType);
    // split payload to item array.

    this.items = this._splitPayloadToItems(payloadBuf);
    return this;
  }

  _splitPayloadToItems(payloadBuf) {
    const itemCount = this.header.itemCount;
    const payloadSize = payloadBuf.length;
    const bufStream = new BufferStream(payloadBuf);
    const items = [];

    for (let i = 0; i < itemCount; i++) {
      const itemLen = bufStream.readUInt32BE();

      if (bufStream.offset + itemLen > payloadSize) {
        throw new RangeError('Payload buffer is smaller than expected.');
      }

      const itemBuf = bufStream.readBuffer(itemLen);
      items.push(itemBuf);
    }

    return items;
  }

  _parsePayloadBuffer(payloadBuf, contentType) {
    const itemCount = this.header.itemCount;
    const payloadSize = payloadBuf.length;
    const bufStream = new BufferStream(payloadBuf);
    const payload = [];

    if (contentType === 'raw') {
      for (let i = 0; i < itemCount; i++) {
        const itemLen = bufStream.readUInt32BE();

        if (bufStream.offset + itemLen > payloadSize) {
          throw new RangeError('Payload buffer is smaller than expected.');
        }

        const itemBuf = bufStream.readBuffer(itemLen);
        payload.push(itemBuf);
      }
    } else if (contentType === 'json') {
      if (itemCount < 1 || payloadBuf.length === 0) {
        return;
      }

      for (let i = 0; i < itemCount; i++) {
        const itemLen = bufStream.readUInt32BE();

        if (bufStream.offset + itemLen > payloadSize) {
          throw new RangeError('Payload buffer is smaller than expected.');
        }

        const itemBuf = bufStream.readBuffer(itemLen);
        payload.push(JSON.parse(itemBuf.toString('utf8')));
      }
    } else {
      for (let i = 0; i < itemCount; i++) {
        const itemLen = bufStream.readUInt32BE();

        if (bufStream.offset + itemLen > payloadSize) {
          throw new RangeError('Payload buffer is smaller than expected.');
        }

        const itemBuf = bufStream.readBuffer(itemLen);
        payload.push(itemBuf.toString('utf8'));
      }
    }

    this.payload = payload;
  }

  _getHeaderBuffer() {
    const header = this.header;
    const topicLen = Buffer.byteLength(header.topic, 'utf8');
    const targetLen = Buffer.byteLength(header.target, 'utf8');
    const headerLen = 16 + topicLen + targetLen;
    const headerBuf = Buffer.alloc(headerLen);
    const bufStream = new BufferStream(headerBuf);
    bufStream.writeUInt64BE(header.id);
    bufStream.writeUInt8(MSG_TYPE[header.type]);
    bufStream.writeUInt8(MSG_CONTENT_TYPE[header.contentType]);
    bufStream.writeHeaderString(header.topic, topicLen);
    bufStream.writeHeaderString(header.target, targetLen);
    bufStream.writeUInt32BE(header.itemCount);
    return bufStream.get();
  }

  _getPayloadBuffer() {
    const payload = this.payload;
    const contentType = this.header.contentType;

    if (!checkContentType(contentType)) {
      throw new TypeError('Unknown payload content type: ' + contentType);
    }

    if (!isIterable(payload)) {
      throw new TypeError('payload should be an iterable object.');
    }

    if (payload.length !== this.header.itemCount) {
      throw new TypeError('payload length should be equal to itemCount.');
    }

    const itemBufs = [];

    if (contentType === 'raw') {
      for (const i in payload) {
        if (!Object.prototype.hasOwnProperty.call(payload, i)) {
          continue;
        }

        const item = payload[i];
        const contentBuf = Buffer.isBuffer(item) ? item : Buffer.from(item);
        const itemBuf = Buffer.allocUnsafe(contentBuf.length + 4);
        itemBuf.writeUInt32BE(contentBuf.length, 0);
        contentBuf.copy(itemBuf, 4);
        itemBufs.push(itemBuf);
      }
    } else if (contentType === 'json') {
      for (const i in payload) {
        if (!Object.prototype.hasOwnProperty.call(payload, i)) {
          continue;
        }

        const item = payload[i];
        const contentBuf = Buffer.from(JSON.stringify(item), 'utf8');
        const itemBuf = Buffer.allocUnsafe(contentBuf.length + 4);
        itemBuf.writeUInt32BE(contentBuf.length, 0);
        contentBuf.copy(itemBuf, 4);
        itemBufs.push(itemBuf);
      }
    } else if (contentType === 'string') {
      for (const i in payload) {
        if (!Object.prototype.hasOwnProperty.call(payload, i)) {
          continue;
        }

        const item = payload[i];
        const contentBuf = Buffer.from(item);
        const itemBuf = Buffer.allocUnsafe(contentBuf.length + 4);
        itemBuf.writeUInt32BE(contentBuf.length, 0);
        contentBuf.copy(itemBuf, 4);
        itemBufs.push(itemBuf);
      }
    }

    return Buffer.concat(itemBufs);
  } // helper methods


  setTopic(topic) {
    this.header.topic = topic;
  }

  setTarget(target) {
    this.header.target = target;
  }

  setItemCount(itemCount) {
    this.header.itemCount = itemCount;
  }

  setPayload(data, contentType) {
    if (!isIterable(data)) {
      throw new TypeError('payload should be an iterable object.');
    }

    if (contentType) {
      this.header.contentType = contentType;
    }

    this.payload = data;
    this.header.itemCount = data.length;
  }

}

class PullMessage extends Message {
  constructor(id, msgLen, headerLen) {
    super('pull', id, msgLen, headerLen);
  }

  createFromBuffer(buf) {
    const headerBuf = buf.slice(8, 8 + this.headerLength);
    const headerBufStream = new BufferStream(headerBuf);
    headerBufStream.offset = 9;
    this.header.contentType = getContentType(headerBufStream.readUInt8());
    this.header.topic = headerBufStream.readHeaderString();
    const payloadBuf = buf.slice(8 + this.headerLength, this.messageLength);
    this.payload = parsePayloadBuffer(payloadBuf, this.header.contentType);
    return this;
  }

  _getHeaderBuffer() {
    const header = this.header;
    const topicLen = Buffer.byteLength(header.topic, 'utf8');
    const headerLen = 11 + topicLen;
    const headerBuf = Buffer.alloc(headerLen);
    const bufStream = new BufferStream(headerBuf);
    bufStream.writeUInt64BE(header.id);
    bufStream.writeUInt8(MSG_TYPE[header.type]);
    bufStream.writeUInt8(MSG_CONTENT_TYPE[header.contentType]);
    bufStream.writeHeaderString(header.topic, topicLen);
    return bufStream.get();
  } // helper methods


  setTopic(topic) {
    this.header.topic = topic;
  }

}

class AckMessage extends Message {
  constructor(id, msgLen, headerLen) {
    super('ack', id, msgLen, headerLen);
  }

  createFromBuffer(buf) {
    const headerBuf = buf.slice(8, 8 + this.headerLength);
    const headerBufStream = new BufferStream(headerBuf);
    headerBufStream.offset = 9;
    this.header.topic = headerBufStream.readHeaderString();
    return this;
  }

  _getHeaderBuffer() {
    const header = this.header;
    const topicLen = Buffer.byteLength(header.topic, 'utf8');
    const headerLen = 10 + topicLen;
    const headerBuf = Buffer.alloc(headerLen);
    const bufStream = new BufferStream(headerBuf);
    bufStream.writeUInt64BE(header.id);
    bufStream.writeUInt8(MSG_TYPE[header.type]);
    bufStream.writeHeaderString(header.topic, topicLen);
    return bufStream.get();
  }

  setTopic(topic) {
    this.header.topic = topic;
  }

}

class MonitorMessage extends Message {
  constructor(id, msgLen, headerLen) {
    super('mon', id, msgLen, headerLen);
  }

  createFromBuffer(buf) {
    const headerBuf = buf.slice(8, 8 + this.headerLength);
    const headerBufStream = new BufferStream(headerBuf);
    headerBufStream.offset = 9;
    this.header.contentType = getContentType(headerBufStream.readUInt8());
    const payloadBuf = buf.slice(8 + this.headerLength, this.messageLength);
    this.payload = parsePayloadBuffer(payloadBuf, this.header.contentType);
    return this;
  }

  _getHeaderBuffer() {
    const header = this.header;
    const headerLen = 10;
    const headerBuf = Buffer.alloc(headerLen);
    const bufStream = new BufferStream(headerBuf);
    bufStream.writeUInt64BE(header.id);
    bufStream.writeUInt8(MSG_TYPE[header.type]);
    bufStream.writeUInt8(MSG_CONTENT_TYPE[header.contentType]);
    return bufStream.get();
  }

} // Factory function to create Message object by type.


exports.create = function (type, id) {
  if (type === 'req') {
    return new RequestMessage(id);
  } else if (type === 'res') {
    return new ResponseMessage(id);
  } else if (type === 'push') {
    return new PushMessage(id);
  } else if (type === 'pull') {
    return new PullMessage(id);
  } else if (type === 'pub') {
    return new PublishMessage(id);
  } else if (type === 'sub') {
    return new SubscribeMessage(id);
  } else if (type === 'ack') {
    return new AckMessage(id);
  } else if (type === 'mon') {
    return new MonitorMessage(id);
  } else if (type === 'sreq') {
    return new ServerRequestMessage(id);
  } else {
    throw new TypeError("Message type:".concat(type, " is not valid."));
  }
}; // Factory function to create Message object from buffer


exports.createFromBuffer = function (buf) {
  // parse new data
  const msgLen = buf.readUInt32BE(0);
  const headerLen = buf.readUInt32BE(4);
  const id = new Int64(buf, 8).toNumber();
  const type = getMessageTypeKey(buf.readUInt8(16, true));
  let msg;

  if (type === 'req') {
    msg = new RequestMessage(id, msgLen, headerLen);
  } else if (type === 'res') {
    msg = new ResponseMessage(id, msgLen, headerLen);
  } else if (type === 'push') {
    msg = new PushMessage(id, msgLen, headerLen);
  } else if (type === 'pull') {
    msg = new PullMessage(id, msgLen, headerLen);
  } else if (type === 'pub') {
    msg = new PublishMessage(id, msgLen, headerLen);
  } else if (type === 'sub') {
    msg = new SubscribeMessage(id, msgLen, headerLen);
  } else if (type === 'ack') {
    msg = new AckMessage(id, msgLen, headerLen);
  } else if (type === 'mon') {
    msg = new MonitorMessage(id, msgLen, headerLen);
  } else if (type === 'sreq') {
    msg = new ServerRequestMessage(id, msgLen, headerLen);
  } else {
    throw new TypeError("Message type:".concat(type, " is not valid."));
  }

  msg.createFromBuffer(buf);
  return msg;
};

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("node-int64");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const path = __webpack_require__(5);

const os = __webpack_require__(2);

exports.toNumber = function (x) {
  const value = Number(x);
  return value >= 0 ? x : false;
};

exports.getSocketPath = function (channel) {
  let pipePath = path.resolve(os.tmpdir(), ".fast.mq.".concat(channel)); // use windows named pipe

  if (process.platform === 'win32') {
    pipePath = pipePath.replace(/^\//, '');
    pipePath = pipePath.replace(/\//g, '-');
    pipePath = "\\\\.\\pipe\\".concat(pipePath);
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

const networkInterfaces = __webpack_require__(2).networkInterfaces();
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

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  REGISTER_FAIL: 0x01,
  TARGET_CHANNEL_NONEXIST: 0x02,
  TOPIC_NONEXIST: 0x03
};

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Int64 = __webpack_require__(1);

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

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("eventemitter3");

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Message = __webpack_require__(0);

class Response {
  constructor(reqMsg, socket) {
    this._reqMsg = reqMsg;
    this.socket = socket;
    this._msg = Message.create('res', reqMsg.header.id); // swap target and source, fill topic and contentType

    const reqHeader = reqMsg.header;

    this._msg.setTopic(reqHeader.topic);

    this._msg.setSource(reqHeader.target);

    this._msg.setTarget(reqHeader.source);

    this._msg.setContentType(reqHeader.contentType);
  }

  header(val) {
    if (val === undefined) {
      return this._msg.header;
    }

    return this._msg.header[val];
  }

  setSource(source) {
    this._msg.setSource(source);
  }

  setTarget(target) {
    this._msg.setTarget(target);
  }

  setError(code) {
    this._msg.setError(code);
  }

  setContentType(type) {
    this._msg.setContentType(type);
  }

  send(data, contentType) {
    if (contentType) {
      this._msg.setContentType(contentType);
    }

    this._msg.setPayload(data);

    this.socket.write(this._msg.getBuffer());
  }

}

module.exports = Response;

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("bluebird");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("net");

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Message = __webpack_require__(0);

const EventEmitter = __webpack_require__(7);

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

/***/ }),
/* 14 */,
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const promiseImpl = __webpack_require__(10);

global.Promise = promiseImpl;

const _ = __webpack_require__(11);

const net = __webpack_require__(12);

const EventEmitter = __webpack_require__(7);

const Message = __webpack_require__(0);

const Response = __webpack_require__(8);

const MessageReceiver = __webpack_require__(13);

const util = __webpack_require__(9);

const common = __webpack_require__(3);

const getSocketPath = common.getSocketPath;
const debug = util.debuglog('fastmq');

class Channel {
  constructor(channelName, options) {
    // public properties
    this.name = channelName; // private properties

    this._options = _.cloneDeep(options);
    this._socket = null;
    this._connected = false;
    this._needReconnect = false;
    this._requestEvent = new EventEmitter();
    this._responseEvent = new EventEmitter();
    this._subEvent = new EventEmitter();
    this._pullEvent = new EventEmitter();
    this._monitorEvent = new EventEmitter();
    this._internalEvent = new EventEmitter();
    this._eventStore = {
      'sub': [],
      'pull': []
    };
    this._watchChannelStore = new Map();
    this._messageHandler = this._messageHandler.bind(this);
    this._msgReceiver = new MessageReceiver(this._messageHandler);

    this._msgReceiver.on('error', err => {
      debug('Message receiver got error:', err.stack);

      this._internalEvent.emit('error', err);
    });
  }

  _messageHandler(msg, rawBuf, socket) {
    if (msg.isRequest()) {
      const res = new Response(msg, socket);
      setImmediate(() => {
        this._requestEvent.emit(msg.header.topic, msg, res);
      });
    } else if (msg.isResponse()) {
      setImmediate(() => {
        this._responseEvent.emit(msg.getEventName(), msg);
      });
    } else if (msg.isPull()) {
      // debug('Got pull message\n# Header:\n', msg.header, '\n# Payload:', msg.payload);
      setImmediate(() => {
        this._pullEvent.emit(msg.header.topic, msg);
      });
    } else if (msg.isSubscribe()) {
      // debug('Got subscribe message\n# Header:\n', msg.header, '\n# Payload:', msg.payload);
      setImmediate(() => {
        this._subEvent.emit(msg.header.topic, msg);
      });
    } else if (msg.isMonitor()) {
      debug('Got monitor message\n# Header:\n', msg.header, '\n# Payload:', msg.payload);
      setImmediate(() => {
        this._monitorEvent.emit(msg.payload.channelPattern, msg);
      });
    }
  }

  onError(listener) {
    if (!_.isFunction(listener)) {
      throw new TypeError('Listener must be a function.');
    }

    this._internalEvent.on('error', listener);
  }

  onReconnect(listener) {
    if (!_.isFunction(listener)) {
      throw new TypeError('Listener must be a function.');
    }

    this._internalEvent.on('reconnect', listener);
  }

  connect(isReconnect) {
    const socketOptions = {
      path: this._options.path,
      port: this._options.port,
      host: this._options.host
    };

    const cbStyle = _.isFunction(this._options.connectListener);

    return new Promise((resolve, reject) => {
      this._socket = net.connect(socketOptions);

      this._socket.on('data', chunk => {
        this._msgReceiver.recv(chunk, this._socket);
      });

      this._socket.on('error', err => {
        this._needReconnect = true;

        this._internalEvent.emit('error', err);
      });

      this._socket.on('connect', () => {
        this._registerChannel().then(() => {
          this._connected = true;
          this._needReconnect = true;
          debug('client connected, _connected:', this._connected);

          if (isReconnect) {
            do {
              const sub = this._eventStore.sub.pop();

              if (!sub) {
                break;
              }

              this.subscribe(sub.topic, sub.listener);
            } while (true);

            do {
              const pull = this._eventStore.pull.pop();

              if (!pull) {
                break;
              }

              this.pull(pull.topic, pull.options, pull.listener);
            } while (true);
          }

          if (cbStyle) {
            this._options.connectListener(null, this);
          } else {
            resolve(this);
          }
        }).catch(err => {
          if (cbStyle) {
            this._options.connectListener(err, this);
          } else {
            reject(err);
          }
        });
      });

      this._socket.on('close', err => {
        this._responseEvent.removeAllListeners();

        this._subEvent.removeAllListeners();

        this._pullEvent.removeAllListeners();

        this._connected = false;

        this._socket.destroy();

        this._socket.unref();

        this._socket = null;
        debug('client close');
        this.reconnect();
      });
    });
  }

  reconnect() {
    if (this._connected || !this._needReconnect) {
      return;
    }

    setTimeout(() => {
      debug('reconnect');
      this.connect(true).then(() => {
        this._internalEvent.emit('reconnect');
      });
    }, this._options.reconnectInterval);
  }
  /* eslint-disable-next-line consistent-return */


  disconnect(graceful) {
    this._needReconnect = false;

    if (graceful) {
      return new Promise((resolve, reject) => {
        let isClose = false;

        if (!this._socket) {
          resolve();
          return;
        }

        this._socket.once('end', () => {
          isClose = true;
          debug("Channel ".concat(this.name, " disconnected"));
          resolve();
          return;
        });

        setTimeout(() => {
          if (!isClose) {
            this._socket.destroy();

            this._socket.unref();

            debug("Channel ".concat(this.name, " disconnected forcelly"));
            resolve();
          }
        }, 1000);

        this._socket.end();
      });
    } else {
      if (this._socket) {
        this._socket.destroy();

        this._socket.unref();
      }
    }
  }

  request(target, topic, data = {}, contentType = 'json') {
    return new Promise((resolve, reject) => {
      try {
        const msg = Message.create('req');
        msg.setTopic(topic);
        msg.setSource(this.name);
        msg.setTarget(target);
        msg.setContentType(contentType);
        msg.setPayload(data);
        const msgBuf = msg.getBuffer();

        this._socket.write(msgBuf); // get response data


        this._responseEvent.once(msg.getEventName(), resMsg => {
          resolve(resMsg);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  _serverRequest(topic, data = {}, contentType = 'json') {
    return new Promise((resolve, reject) => {
      try {
        const msg = Message.create('sreq');
        msg.setTopic(topic);
        msg.setSource(this.name);
        msg.setTarget('');
        msg.setContentType(contentType);
        msg.setPayload(data);
        const msgBuf = msg.getBuffer();

        this._socket.write(msgBuf); // get response data


        this._responseEvent.once(msg.getEventName(), resMsg => {
          resolve(resMsg);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  _registerChannel() {
    return this._serverRequest('register').then(msg => {
      if (msg.header.error) {
        const err = new Error('register channel fail. errCode:' + msg.header.error);
        throw err;
      } else {
        if (_.isString(msg.payload.channelName)) {
          this.name = msg.payload.channelName;
        }

        return this;
      }
    });
  }

  getChannels(name, type) {
    if (!_.isString(name)) {
      return Promise.reject(new Error('get channel fail, channel name must be string type'));
    }

    const parameters = {
      channelName: name,
      type: type ? type : 'glob'
    };
    return this._serverRequest('getChannels', parameters).then(msg => {
      if (msg.header.error) {
        const err = new Error('get channel fail. errCode:' + msg.header.error);
        throw err;
      } else {
        if (!_.isArray(msg.payload.channels)) {
          throw new Error('channel list should be array type');
        }

        return msg.payload.channels;
      }
    });
  }

  watchChannels(name, callback) {
    if (!_.isString(name)) {
      return Promise.reject(new Error('get channel fail, channel name must be string type'));
    }

    return this._serverRequest('watchChannels', {
      channelName: name
    }).then(msg => {
      if (msg.header.error) {
        const err = new Error('get channel fail. errCode:' + msg.header.error);
        throw err;
      } else {
        if (!_.isString(msg.payload.channelPattern)) {
          throw new Error('channelPattern should be string type');
        }

        if (!_.isArray(msg.payload.channelNames)) {
          throw new Error('channelNames should be array type');
        }

        const channelPattern = msg.payload.channelPattern;

        this._watchChannelStore.set(channelPattern, msg.payload.channelNames);

        this._monitorEvent.on(channelPattern, monMsg => {
          const payload = monMsg.payload;

          const channels = this._watchChannelStore.get(channelPattern);

          if (payload.action === 'add') {
            channels.push(payload.channel);
          } else if (payload.action === 'remove') {
            _.pull(channels, payload.channel);
          }

          callback(payload.action, payload.channel, channels);
        });

        return {
          channelPattern: channelPattern,
          channels: msg.payload.channelNames
        };
      }
    });
  }

  response(topic, listener) {
    this._requestEvent.on(topic, (reqMsg, res) => {
      listener(reqMsg, res);
    }); // register this request listener to server


    this._serverRequest('addResponseListener', {
      topic: topic
    }, 'json').then(resMsg => {
      debug("addResponseListener topic: ".concat(topic, ", result: ").concat(resMsg.payload.result));

      if (resMsg.isError('REGISTER_FAIL')) {
        this._requestEvent.removeAllListeners(topic);

        this._internalEvent.emit('error', new Error("Register pull listener for topic: ".concat(topic, " fail")));
      }
    });

    return this;
  }

  push(target, topic, items, contentType = 'json') {
    if (arguments.length < 3) {
      return Promise.reject(new Error('Need at least three arguments.'));
    }

    return new Promise((resolve, reject) => {
      const msg = Message.create('push');
      msg.setTopic(topic);
      msg.setTarget(target);
      msg.setPayload(items, contentType);

      this._socket.write(msg.getBuffer(), 'utf8', () => {
        resolve();
      });
    });
  }

  pull(topicArg, optionsArg, listenerArg) {
    if (arguments.length < 2) {
      return Promise.reject(new Error('Need at least two arguments.'));
    }

    const topic = topicArg;
    const options = arguments.length === 2 ? {
      prefetch: 1
    } : optionsArg;
    const listener = arguments.length === 2 ? optionsArg : listenerArg;
    const regPayload = {
      topic: topic,
      options: options
    };

    this._pullEvent.on(topic, msg => {
      Promise.resolve(listener(msg)).then(() => {
        this._sendAck(msg.header.id, topic);
      });
    });

    return this._serverRequest('addPullListener', regPayload, 'json').then(resMsg => {
      if (resMsg.isError('REGISTER_FAIL')) {
        this._pullEvent.removeAllListeners(topic);

        this._internalEvent.emit('error', new Error("Register pull listener for topic: ".concat(topic, " fail")));
      } else {
        this._eventStore.pull.push({
          topic: topic,
          options: options,
          listener: listener
        });
      }

      return this;
    });
  }

  publish(target, topic, data, contentType = 'json') {
    if (!this._connected) {
      this._internalEvent.emit('error', new Error("Publish ".concat(topic, " fail, under disconnect state, ").concat(this._connected)));

      return Promise.resolve();
    }

    if (arguments.length < 3) {
      return Promise.reject(new Error('Need at least three arguments.'));
    }

    return new Promise((resolve, reject) => {
      const msg = Message.create('pub');
      msg.setTopic(topic);
      msg.setTarget(target);
      msg.setPayload(data, contentType);

      this._socket.write(msg.getBuffer(), 'utf8', () => {
        resolve();
      });
    });
  }

  subscribe(topic, listener) {
    if (arguments.length < 2) {
      return Promise.reject(new Error('Need at least two arguments.'));
    }

    const regPayload = {
      topic: topic
    };

    this._subEvent.on(topic, msg => {
      listener(msg);
    });

    return this._serverRequest('addSubscribeListener', regPayload, 'json').then(resMsg => {
      if (resMsg.isError('REGISTER_FAIL')) {
        this._subEvent.removeAllListeners(topic);

        this._internalEvent.emit('error', new Error("Register subscribe listener for topic: ".concat(topic, " fail")));
      } else {
        this._eventStore.sub.push({
          topic: topic,
          listener: listener
        });
      }

      return this;
    });
  }

  _sendAck(id, topic) {
    const msg = Message.create('ack', id);
    msg.setTopic(topic); // debug('Send Ack. header:', msg.header);

    this._socket.write(msg.getBuffer());
  }

} // connect(channelName, serverPath, [connectListener])
// connect(channelName, port[, host][, connectListener])
// connect(channelName, options[, connectListener])
// options = {
//     host: '127.0.0.1',
//     port: 5555,
//     reconnect: true,
//     reconnectInterval: 1000
// }


exports.connect = function (...args) {
  if (args.length < 2) {
    throw new Error('Invalid create argument, it needs at least two argument.');
  }

  if (!_.isString(args[0])) {
    throw new TypeError('Invalid client channel name, channel name must be a string type.');
  } // set channel name to anonymous or specific one


  const channelName = _.isNil(args[0]) ? '' : args[0].trim();
  const connectListener = args[args.length - 1];
  let options = {};
  const defaultOptions = {
    reconnect: true,
    reconnectInterval: 1000
  }; // process options, port or serverPath

  if (_.isPlainObject(args[1])) {
    const opts = args[1];
    options = _.merge(defaultOptions, opts);
  } else if (_.isString(args[1])) {
    options.path = getSocketPath(args[1]);
  } else if (_.isNumber(args[1])) {
    options.port = args[1];
  }

  if (args.length > 2 && _.isString(args[2])) {
    options.host = args[2];
  }

  debug('options:', options);
  options.connectListener = connectListener;
  const channel = new Channel(channelName, options);
  return channel.connect();
};

/***/ })
/******/ ]);