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
/******/ 	return __webpack_require__(__webpack_require__.s = 16);
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

  isError(name) {
    const errCode = ErrorCode[name];

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
/* 14 */
/***/ (function(module, exports) {

module.exports = require("glob-to-regexp");

/***/ }),
/* 15 */,
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const promiseImpl = __webpack_require__(10);

global.Promise = promiseImpl;

const _ = __webpack_require__(11);

const net = __webpack_require__(12);

const fs = __webpack_require__(17);

const EventEmitter = __webpack_require__(7);

const QueueManager = __webpack_require__(18);

const Message = __webpack_require__(0);

const Response = __webpack_require__(8);

const MessageReceiver = __webpack_require__(13);

const ChannelManager = __webpack_require__(20);

const ErrorCode = __webpack_require__(4);

const common = __webpack_require__(3);

const getSocketPath = common.getSocketPath;
const uniqid = common.uniqid;

const util = __webpack_require__(9);

const debug = util.debuglog('fastmq');

class Server {
  constructor(options) {
    // public properties
    this.channel = options.name; // private properties

    if (options.port === undefined) {
      this._serverOptions = {
        path: getSocketPath(options.name),
        exclusive: false
      };
    } else {
      this._serverOptions = {
        port: options.port,
        host: options.host,
        exclusive: false
      };
    }

    this._server = null;
    this._sockets = [];
    this._channels = new ChannelManager();
    this._queueManager = new QueueManager(); // bind message handler

    this._messageHandler = this._messageHandler.bind(this); // create message receiver with message handler

    this._msgReceiver = new MessageReceiver(this._messageHandler);
    this._requestHandlers = {}; // event emitters

    this._requestEvent = new EventEmitter();
    this._responseEvent = new EventEmitter();
    this._handleConnection = this._handleConnection.bind(this);
    this._handleServerError = this._handleServerError.bind(this); // register server channel first

    this._channels.register(this.channel, null);
  }

  _messageHandler(msg, rawBuf, socket) {
    const header = msg.header;

    if (msg.isRequest()) {
      // Request message
      // forward to other client channel
      if (header.target !== this.channel) {
        this._forwardRequestMessage(msg, rawBuf, socket);
      } else {
        // handle this request message
        // process internal requests first, then forward to external
        // request handlers if request topic doesn't handled by
        // internal request handler
        if (!this._processInternalRequest(msg, socket)) {
          const res = new Response(msg, socket);

          const targetChannel = this._channels.findResponseTopic(this.channel, msg.header.topic);

          if (!targetChannel) {
            res.setError(ErrorCode.TOPIC_NONEXIST);
            res.send('', 'json');
          } else {
            process.nextTick(() => {
              this._requestEvent.emit(header.topic, msg, res);
            });
          }
        }
      }
    } else if (msg.isServerRequest()) {
      debug('process server request'); // process server request

      const res = new Response(msg, socket);

      if (!this._processInternalRequest(msg, socket)) {
        res.setError(ErrorCode.TOPIC_NONEXIST);
        res.send('', 'json');
      }
    } else if (msg.isResponse()) {
      // Response message
      if (header.target !== this.channel) {
        this._forwardResponseMessage(msg, rawBuf);
      } else {
        process.nextTick(() => {
          this._responseEvent.emit(msg.getEventName(), msg);
        });
      }
    } else if (msg.isPush()) {
      // Push message
      this._queueManager.processPushTasks(header.target, header.topic, msg.items, header.contentType);
    } else if (msg.isPublish()) {
      // Publish message
      this._queueManager.processPublishTask(header.target, header.topic, msg.payloadBuf, header.contentType);
    } else if (msg.isAck()) {
      // Acknowledge message
      this._queueManager.handleAck(msg);
    }
  }

  _prepareListeners() {
    this._server.on('listening', () => {});

    this._server.on('connection', this._handleConnection);

    this._server.on('error', this._handleServerError);

    this._msgReceiver.on('error', err => {
      debug('Message Receiver error:', err.stack);
    }); // this._msgReceiver.on('message', this._messageHandler);

  }

  _setupRequestHandlers() {
    // setup internal request handlers
    this._requestHandlers.register = (msg, res) => {
      let srcChannel = msg.header.source;
      const socket = res.socket; // handle anonymous channel registeration

      if (srcChannel.length === 0 || srcChannel === '') {
        do {
          srcChannel = uniqid();
        } while (this._channels.has(srcChannel));
      } else if (srcChannel.indexOf('#') !== -1) {
        // handle wildcard uniqle id channel registeration
        do {
          const id = uniqid();
          srcChannel = srcChannel.replace(/#/g, id);
        } while (this._channels.has(srcChannel));
      }

      debug("srcChannel: ".concat(srcChannel));

      if (this._channels.has(srcChannel)) {
        debug("Channel '".concat(srcChannel, "' already exist."));
        res.setError(ErrorCode.REGISTER_FAIL);
      } else {
        this._channels.register(srcChannel, socket);

        debug("Register channel '".concat(srcChannel, "'"));
      }

      res.send({
        channelName: srcChannel
      }, 'json');
    };

    this._requestHandlers.addResponseListener = (msg, res) => {
      const name = msg.header.source;

      const channel = this._channels.addResponse(name, msg.payload.topic);

      if (!channel) {
        res.setError(ErrorCode.REGISTER_FAIL);
      }

      res.send({
        result: channel ? true : false
      }, 'json');
    };

    this._requestHandlers.addPullListener = (msg, res) => {
      const payload = msg.payload;
      const name = msg.header.source;

      const channel = this._channels.addPull(name, payload.topic, payload.options);

      if (!channel) {
        res.setError(ErrorCode.REGISTER_FAIL);
      }

      const queue = this._queueManager.get('pull', payload.topic);

      queue.addChannel(channel);
      res.send({
        result: channel ? true : false
      }, 'json');
    };

    this._requestHandlers.addSubscribeListener = (msg, res) => {
      const payload = msg.payload;
      const name = msg.header.source;

      const channel = this._channels.addSubscribe(name, payload.topic, payload.options);

      if (!channel) {
        res.setError(ErrorCode.REGISTER_FAIL);
      }

      const queue = this._queueManager.get('sub', payload.topic);

      queue.addChannel(channel);
      res.send({
        result: channel ? true : false
      }, 'json');
    };
  }

  start() {
    if (!this._server) {
      this._server = net.createServer();

      this._prepareListeners();

      this._setupRequestHandlers();
    }

    return new Promise((resolve, reject) => {
      this._server.listen(this._serverOptions, () => {
        resolve(this);
      });
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      this._shutdown();

      this._server.close(() => {
        resolve(this);
      });
    });
  } // Send request to client channel


  request(target, topic, data = {}, contentType = 'json') {
    return new Promise((resolve, reject) => {
      if (!this._channels.contains(target)) {
        reject(new Error("Target channel[".concat(target, "] doesn't exist.")));
        return;
      }

      try {
        const msg = Message.create('req');
        msg.setTopic(topic);
        msg.setSource(this.channel);
        msg.setTarget(target);
        msg.setContentType(contentType);
        msg.setPayload(data);
        const msgBuf = msg.getBuffer();

        this._client.write(msgBuf); // get response data


        this._responseEvent.once(msg.getEventName(), resMsg => {
          resolve(resMsg);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  response(topic, listener) {
    this._channels.addResponse(this.channel, topic);

    this._requestEvent.on(topic, (msg, res) => {
      listener(msg, res);
    });

    return this;
  }

  _forwardRequestMessage(reqMsg, rawReqBuf, sourceSocket) {
    const targetChannel = this._channels.findResponseTopic(reqMsg.header.target, reqMsg.header.topic);

    if (!targetChannel) {
      const res = new Response(reqMsg, sourceSocket); // set source to this server channel

      res.setSource(this.channel); // set target channel doesn't exist error code

      res.setError(ErrorCode.TARGET_CHANNEL_NONEXIST);
      res.send('', 'json');
      return;
    } // forward raw request buffer to target


    targetChannel.socket.write(rawReqBuf);
  }

  _forwardResponseMessage(resMsg, rawResBuf) {
    const target = resMsg.header.target;

    const targetChannel = this._channels.get(target);

    if (!targetChannel) {
      debug("The target channel '".concat(target, "' of Response message does not exist."));
      return;
    } // forward raw response buffer to target


    targetChannel.socket.write(rawResBuf);
  }

  _processInternalRequest(msg, socket) {
    const header = msg.header;
    const topic = header.topic;

    if (this._requestHandlers.hasOwnProperty(topic)) {
      const res = new Response(msg, socket);

      this._requestHandlers[topic].call(this, msg, res);

      return true;
    }

    return false;
  }

  _handleConnection(socket) {
    this._sockets.push(socket);

    socket.on('data', chunk => {
      this._msgReceiver.recv(chunk, socket);
    });
    /* eslint-disable handle-callback-err */

    socket.on('error', err => {
      socket.unref();
    });
    /* eslint-enable handle-callback-err */

    socket.on('close', () => {
      // remove socket from socket pool
      const socketIndex = this._sockets.indexOf(socket);

      if (socketIndex !== -1) {
        this._sockets.splice(socketIndex, 1);
      } // unregister channel


      const channel = this._channels.unregisterBySocket(socket);

      if (channel) {
        this._queueManager.removeChannels(channel);

        debug("Un-register channel '".concat(channel, "'"));
      }
    });
  }

  _shutdown() {
    this._sockets.forEach(socket => {
      if (socket && socket.destroy) {
        socket.destroy();
      }
    });

    this._sockets = [];

    this._channels.unregisterAll();
  }

  _handleServerError(err) {
    if (err.code === 'EADDRINUSE') {
      if (this._serverOptions.path) {
        this._server.close();

        fs.unlinkSync(this._serverOptions.path);
      } else {
        this._server.close();
      }

      setTimeout(() => {
        this._server.listen(this._serverOptions);
      }, 300);
    } else {
      debug('Message broker server got error:', error.stack);
    }
  }

} // create(name)
// create(port[, host])


exports.create = function (...args) {
  if (args.length < 1) {
    throw new Error('Invalid create argument, it needs at least one argument.');
  }

  const options = {}; // get channel name

  if (!_.isString(args[0])) {
    throw new TypeError('Invalid channel name, channel name must be a string type.');
  } else {
    options.name = args[0];
  }

  if (args.length > 1) {
    if (_.isNumber(args[1])) {
      // create(name, port[, host])
      options.port = _.toNumber(args[1]);

      if (args.length > 2 && _.isString(args[2])) {
        options.host = args[2];
      }
    }
  }

  if (_.isInteger(options.port) && _.isNil(options.host)) {
    options.host = 'localhost';
  }

  return new Server(options);
};

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Queue = __webpack_require__(19);

const globToRegExp = __webpack_require__(14);

const generateUuid = __webpack_require__(3).uuid;

const Message = __webpack_require__(0);

const util = __webpack_require__(9);

const debug = util.debuglog('fastmq');

function getChannelHandler(channel, topic) {
  if (!channel.handlers.hasOwnProperty(topic)) {
    return null;
  }

  return channel.handlers[topic];
}

function createMessage(type, item, topic) {
  const msg = Message.create(type, item.id);
  msg.setContentType(item.contentType);
  msg.setTopic(topic);
  msg.setPayloadBuf(item.data);
  return msg;
}

class TaskQueue {
  constructor(type, topic) {
    this._type = type;
    this._topic = topic;
    this._channels = [];
    this._queue = new Queue(16);
    this._nonAckTasks = {};
    this._channelIndex = 0;
    this._subChannelCache = new Map();
  }

  _updateSubChannelCache(name) {
    debug("TaskQueue._updateSubChannelCache, name: ".concat(name));

    this._subChannelCache.forEach((value, key, map) => {
      const regex = new RegExp(key);
      debug("TaskQueue._updateSubChannelCache, key: ".concat(regex, ", name: ").concat(name));

      if (regex.test(name)) {
        debug("TaskQueue._updateSubChannelCache, Find matched, remove channel cache: ".concat(regex));
        map.delete(key);
      }
    });
  }

  addChannel(channel) {
    const handler = getChannelHandler(channel, this._topic);

    if (!handler) {
      return false;
    }

    const channelName = channel.name;
    channel.socket.on('close', () => {
      debug("TaskQueue: socket.close, channel: ".concat(channelName));

      if (handler.type === 'pull') {
        this.redeliver(channelName);
      }

      this.removeChannel(channelName);
    });

    this._channels.push({
      name: channelName,
      socket: channel.socket,
      type: handler.type,
      prefetch: handler.options.prefetch || 1,
      availCount: handler.options.prefetch || 1
    }); // flush task in queue when new channel added


    if (!this._queue.isEmpty()) {
      this.process();
    }

    debug("TaskQueue.addChannel name: ".concat(channelName, "  type: ").concat(handler.type));

    if (handler.type === 'subscribe') {
      this._updateSubChannelCache(channelName);
    }

    return true;
  }

  removeChannel(name) {
    const len = this._channels.length;
    let isSubChannel = false;

    for (let i = len - 1; i >= 0; i--) {
      const channel = this._channels[i];

      if (channel.name === name) {
        this._channels.splice(i, 1);

        isSubChannel = true;
      }
    }

    if (this._channelIndex >= this._channels.length) {
      this._channelIndex = 0;
    }

    if (isSubChannel) {
      this._updateSubChannelCache(name);
    }
  }

  enqueue(data, targetRegExp, contentType) {
    const task = {
      id: generateUuid(),
      targetRegExp: targetRegExp,
      contentType: contentType,
      data: data
    };

    this._queue.enqueue(task);
  }

  process() {
    if (this._type === 'pull') {
      this._processPullMessages();
    } else if (this._type === 'sub') {
      this._processSubscribeMessages();
    }
  }

  redeliver(channelName) {
    for (const id in this._nonAckTasks) {
      if (!Object.prototype.hasOwnProperty.call(this._nonAckTasks, id)) {
        continue;
      }

      const task = this._nonAckTasks[id];

      if (task.channel === channelName) {
        const redeliverTask = {
          id: task.id,
          targetRegExp: task.targetRegExp,
          contentType: task.contentType,
          data: task.data
        };
        debug('redeliver task:', redeliverTask);

        this._queue.enqueue(redeliverTask);

        delete this._nonAckTasks[id];
      }
    }
  }

  handleAck(id) {
    const tasks = this._nonAckTasks;

    if (!tasks.hasOwnProperty(id)) {
      return false;
    }

    const item = tasks[id]; // debug('Handle Ack, item id:' + id);

    const len = this._channels.length;

    for (let i = 0; i < len; i++) {
      if (this._channels[i].name === item.channel) {
        this._channels[i].availCount++;
        break;
      }
    }

    delete tasks[id]; // run process again when receive acknowledge

    this.process();
    return true;
  }

  _dropTask() {
    const taskQueue = this._queue;
    const curItem = taskQueue.peekFront();

    if (!this._channelMatch(curItem.targetRegExp)) {
      debug('Drop task in queue:', curItem); // drop task when no channel matches current task item

      taskQueue.dequeue();
      return true;
    }

    return false;
  }

  _processPullMessages() {
    const taskQueue = this._queue;
    let queueIsEmpty = false; // const channelAvailable = this._channelAvailable('pull');
    // debug(`Channel available: ${channelAvailable}, queue size: ${taskQueue.length}`);

    let loopCount = 0;
    const maxLoopCount = taskQueue.length * (this._channels.length ? this._channels.length * 2 : 2);

    while (!taskQueue.isEmpty() && this._channelAvailable('pull')) {
      if (loopCount++ >= maxLoopCount) {
        warn('Exceed max. loop trying count:' + maxLoopCount);
        break;
      }

      if (this._dropTask()) {
        continue;
      }

      const curIndex = this._channelIndex;
      const channel = this._channels[curIndex];
      const availCount = channel.availCount; // debug(`current channel name: ${channel.name}, type: ${channel.type} availCount: ${availCount}, queue size: ${taskQueue.length}`);

      for (let i = 0; i < availCount; i++) {
        queueIsEmpty = taskQueue.isEmpty();

        if (queueIsEmpty) {
          break;
        } // dequeue task and write pull messsage to channel


        const item = taskQueue.dequeue();
        const msg = createMessage('pull', item, this._topic);
        channel.socket.write(msg.getBuffer());
        channel.availCount--; // add current item to non-ack. task

        const nonAckItem = {
          id: item.id,
          targetRegExp: item.targetRegExp,
          contentType: item.contentType,
          channel: channel.name,
          data: item.data
        };
        this._nonAckTasks[item.id] = nonAckItem;
      }

      if (!queueIsEmpty) {
        // set channel index to next
        this._nextChannel();
      }
    }
  }

  _processSubscribeMessages() {
    const taskQueue = this._queue;
    debug("Process SUB messages, queue size: ".concat(taskQueue.length));

    while (!taskQueue.isEmpty()) {
      const item = taskQueue.dequeue();

      const subChannels = this._getSubscribeChannels(item.targetRegExp);

      const subChannelLength = subChannels.length;
      debug("item target: ".concat(item.targetRegExp.toString(), ", subChannelLength: ").concat(subChannelLength));
      const msg = createMessage('sub', item, this._topic);

      for (let i = 0; i < subChannelLength; i++) {
        const channel = subChannels[i];
        channel.socket.write(msg.getBuffer());
      }
    }
  }

  _nextChannel() {
    const curIndex = this._channelIndex;
    this._channelIndex = curIndex + 1 < this._channels.length ? curIndex + 1 : 0;
  }

  _channelMatch(regexp) {
    const len = this._channels.length;
    let match = false;

    for (let i = 0; i < len; i++) {
      const channel = this._channels[i];

      if (regexp.test(channel.name)) {
        match = true;
        break;
      }
    }

    return match;
  }

  _channelAvailable(type) {
    const len = this._channels.length;
    let avail = false;

    for (let i = 0; i < len; i++) {
      const channel = this._channels[i];

      if (channel.type === type && channel.availCount > 0) {
        avail = true;
        break;
      }
    }

    return avail;
  }

  _getSubscribeChannels(regexp) {
    const cacheKey = regexp.source;

    const cache = this._subChannelCache.get(cacheKey);

    if (cache) {
      return cache;
    }

    const len = this._channels.length;
    const channels = [];

    for (let i = 0; i < len; i++) {
      const channel = this._channels[i];

      if (channel.type === 'subscribe' && regexp.test(channel.name)) {
        channels.push(channel);
      }
    }

    this._subChannelCache.set(cacheKey, channels);

    return channels;
  }

}

class QueueManager {
  constructor() {
    this._taskQueues = {};
  }

  get(type, topic) {
    // debug(`QueueManager get, type=${type} topic=${topic}`);
    if (!this._taskQueues.hasOwnProperty(topic)) {
      this._taskQueues[topic] = {};
    }

    if (!this._taskQueues[topic].hasOwnProperty(type)) {
      this._taskQueues[topic][type] = new TaskQueue(type, topic);
    }

    return this._taskQueues[topic][type];
  }

  removeTopic(topic) {
    if (this._taskQueues.hasOwnProperty(topic)) {
      delete this._taskQueues[topic];
    }
  }

  removeChannels(name) {
    for (const topic in this._taskQueues) {
      if (!Object.prototype.hasOwnProperty.call(this._taskQueues, topic)) {
        continue;
      }

      const topicQueue = this._taskQueues[topic];

      for (const taskType in topicQueue) {
        if (!Object.prototype.hasOwnProperty.call(topicQueue, taskType)) {
          continue;
        }

        topicQueue[taskType].removeChannel(name);
      }
    }
  }

  handleAck(msg) {
    const header = msg.header;

    if (!this._taskQueues.hasOwnProperty(header.topic)) {
      return false;
    } // only push/pull task nees to handle acknowledge


    if (this._taskQueues[header.topic].hasOwnProperty('pull')) {
      return this._taskQueues[header.topic].pull.handleAck(header.id);
    }

    return false;
  }

  processPublishTask(target, topic, payload, contentType) {
    const queue = this.get('sub', topic);
    const targetRegExp = globToRegExp(target);
    queue.enqueue(payload, targetRegExp, contentType);
    queue.process();
  }

  processPushTasks(target, topic, items, contentType) {
    const queue = this.get('pull', topic);
    const itemCount = items.length;
    const targetRegExp = globToRegExp(target);

    for (let i = 0; i < itemCount; i++) {
      queue.enqueue(items[i], targetRegExp, contentType);
    }

    queue.process();
  }

}

module.exports = QueueManager;

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("double-ended-queue");

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const globToRegExp = __webpack_require__(14);

const util = __webpack_require__(9);

const debug = util.debuglog('fastmq');

function getRandomInt(min, max) {
  const minVal = Math.ceil(min);
  const maxVal = Math.floor(max);
  return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}

class ChannelManager {
  constructor() {
    this._channels = {};
    this._channelCache = new Map();
  }

  has(name) {
    return this._channels.hasOwnProperty(name);
  }

  contains(nameGlob) {
    const re = globToRegExp(nameGlob);

    for (const key in this._channels) {
      if (re.test(key)) {
        return true;
      }
    }

    return false;
  }

  _updateChannelCache(name) {
    debug("ChannelManager._updateChannelCache, name: ".concat(name));

    this._channelCache.forEach((value, key, map) => {
      const regex = new RegExp(key);
      debug("ChannelManager._updateChannelCache, regex: ".concat(regex.toString(), ", name: ").concat(name));

      if (regex.test(name)) {
        debug("ChannelManager._updateChannelCache, find matched, remove channel cache: ".concat(regex.toString()));
        map.delete(regex);
      }
    });
  }

  register(name, socket) {
    if (this.has(name)) {
      delete this._channels[name];
    }

    this._channels[name] = {
      name: name,
      socket: socket,
      handlers: {}
    };

    this._updateChannelCache(name);
  }

  unregister(name) {
    debug('unregister channel name: ' + name);
    delete this._channels[name];

    this._updateChannelCache(name);
  }

  unregisterBySocket(socket) {
    let removeChannelName;

    for (const key in this._channels) {
      if (this._channels[key].socket === socket) {
        this.unregister(key);
        removeChannelName = key;
        break;
      }
    }

    return removeChannelName;
  }

  unregisterAll() {
    Object.keys(this._channels).forEach(name => {
      this.unregister(name);
    });
  }

  addResponse(name, topic, options) {
    return this._add('response', name, topic, options);
  }

  addPull(name, topic, options) {
    return this._add('pull', name, topic, options);
  }

  addSubscribe(name, topic, options) {
    return this._add('subscribe', name, topic, options);
  }

  get(name) {
    return this.has(name) ? this._channels[name] : null;
  }

  find(nameGlob) {
    const re = globToRegExp(nameGlob);
    const cacheKey = re.source;

    const cache = this._channelCache.get(cacheKey);

    if (cache) {
      return cache;
    }

    const channels = [];

    for (const key in this._channels) {
      if (re.test(key)) {
        channels.push(channel);
      }
    }

    debug('set channel cache, key: ', cacheKey);

    this._channelCache.set(cacheKey, channels);

    return channels;
  }

  findResponseTopic(nameGlob, topic) {
    // Request/Response pattern is 1-1,
    // so we need to return only one channel
    const channels = this._findTopic('response', nameGlob, topic); // debug(`findResponseTopic name:${nameGlob} topic: ${topic}, results: ${channels.length}`);


    if (channels.length === 0) {
      return null;
    }

    if (channels.length === 1) {
      return channels[0];
    } // choose random one


    return channels[getRandomInt(0, channles.length - 1)];
  }

  findPullTopic(nameGlob, topic) {
    return this._findTopic('pull', nameGlob, topic);
  }

  findSubscribeTopic(nameGlob, topic) {
    return this._findTopic('subscribe', nameGlob, topic);
  }

  _add(type, name, topic, options) {
    // debug(`_add type:${type} name:${name} topic: ${topic}`);
    if (!this.has(name)) {
      return false;
    }

    this._channels[name].handlers[topic] = {
      type: type,
      options: options || {}
    };
    return this._channels[name];
  }

  _findTopic(type, nameGlob, topic) {
    const channels = [];
    const re = globToRegExp(nameGlob);
    const cacheKey = re.source;

    const cache = this._channelCache.get(cacheKey);

    if (cache) {
      for (const key in cache) {
        if (!Object.hasOwnProperty.call(cache, key)) {
          continue;
        }

        const channel = this._channels[key];
        const handlers = channel.handlers;

        if (handlers.hasOwnProperty(topic) && handlers[topic].type === type) {
          // debug(`got channel ${key} by type: ${type}, topic: ${topic}`);
          channels.push(channel);
        }
      }
    } else {
      for (const key in this._channels) {
        if (!Object.hasOwnProperty.call(this._channels, key)) {
          continue;
        }

        if (re.test(key) || key === nameGlob) {
          const channel = this._channels[key];
          const handlers = channel.handlers;

          if (handlers.hasOwnProperty(topic) && handlers[topic].type === type) {
            // debug(`got channel ${key} by type: ${type}, topic: ${topic}`);
            channels.push(channel);
          }
        }
      }
    }

    return channels;
  }

}

module.exports = ChannelManager;

/***/ })
/******/ ]);