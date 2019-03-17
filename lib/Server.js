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
/******/ 	return __webpack_require__(__webpack_require__.s = 24);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

module.exports = _interopRequireDefault;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(6));

var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(7));

var _inherits2 = _interopRequireDefault(__webpack_require__(8));

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(1));

var _createClass2 = _interopRequireDefault(__webpack_require__(2));

var Int64 = __webpack_require__(4);

var generateUuid = __webpack_require__(5).uuid;

var BufferStream = __webpack_require__(15);

var ErrorCode = __webpack_require__(9);

var MSG_TYPE = {
  req: 1,
  res: 2,
  push: 3,
  pull: 4,
  pub: 5,
  sub: 6,
  ack: 7
};
var MSG_CONTENT_TYPE = {
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
    pub: 4,
    sub: 5,
    ack: 6
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
  for (var key in MSG_TYPE) {
    if (val === MSG_TYPE[key]) {
      return key;
    }
  }

  return null;
}

function getContentType(type) {
  var contentType;

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

var Message =
/*#__PURE__*/
function () {
  function Message(type, id, msgLen, headerLen) {
    (0, _classCallCheck2.default)(this, Message);
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

  (0, _createClass2.default)(Message, [{
    key: "isRequest",
    value: function isRequest() {
      return this.header.type === 'req';
    }
  }, {
    key: "isResponse",
    value: function isResponse() {
      return this.header.type === 'res';
    }
  }, {
    key: "isPush",
    value: function isPush() {
      return this.header.type === 'push';
    }
  }, {
    key: "isPull",
    value: function isPull() {
      return this.header.type === 'pull';
    }
  }, {
    key: "isPublish",
    value: function isPublish() {
      return this.header.type === 'pub';
    }
  }, {
    key: "isSubscribe",
    value: function isSubscribe() {
      return this.header.type === 'sub';
    }
  }, {
    key: "isAck",
    value: function isAck() {
      return this.header.type === 'ack';
    }
  }, {
    key: "getEventName",
    value: function getEventName() {
      return this.header.topic + '.' + this.header.id;
    }
  }, {
    key: "setType",
    value: function setType(type) {
      if (!checkType(type)) {
        throw new TypeError('Invalid message type: ' + type);
      }

      this.header.type = type;
    }
  }, {
    key: "setContentType",
    value: function setContentType(type) {
      if (!checkContentType(type)) {
        throw new TypeError('Invalid message content type: ' + type);
      }

      this.header.contentType = type;
    }
  }, {
    key: "setPayload",
    value: function setPayload(data, contentType) {
      if (contentType) {
        this.header.contentType = contentType;
      }

      this.payload = data;
    }
  }, {
    key: "setPayloadBuf",
    value: function setPayloadBuf(buf) {
      this.payloadBuf = buf;
    }
  }, {
    key: "getBuffer",
    value: function getBuffer() {
      var headerBuf = this._getHeaderBuffer();

      this.headerLength = headerBuf.length;
      this.messageLength = 8 + this.headerLength;

      if (!this.payloadBuf && this.payload) {
        this.payloadBuf = this._getPayloadBuffer();
      }

      if (this.payloadBuf) {
        this.messageLength += this.payloadBuf.length;
      }

      var msgBuf = Buffer.allocUnsafe(this.messageLength);
      msgBuf.writeUInt32BE(this.messageLength);
      msgBuf.writeUInt32BE(this.headerLength, 4); // copy header to message buffer

      headerBuf.copy(msgBuf, 8); // copy payload to message buffer

      if (this.payloadBuf) {
        this.payloadBuf.copy(msgBuf, 8 + this.headerLength);
      }

      return msgBuf;
    }
  }, {
    key: "_getPayloadBuffer",
    value: function _getPayloadBuffer() {
      var payload = this.payload;
      var contentType = this.header.contentType;
      var payloadBuf;

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
  }]);
  return Message;
}();

var RequestMessage =
/*#__PURE__*/
function (_Message) {
  (0, _inherits2.default)(RequestMessage, _Message);

  function RequestMessage(id, msgLen, headerLen) {
    (0, _classCallCheck2.default)(this, RequestMessage);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(RequestMessage).call(this, 'req', id, msgLen, headerLen));
  }

  (0, _createClass2.default)(RequestMessage, [{
    key: "createFromBuffer",
    value: function createFromBuffer(buf) {
      var headerBuf = buf.slice(8, 8 + this.headerLength);
      var headerBufStream = new BufferStream(headerBuf);
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
  }, {
    key: "_getHeaderBuffer",
    value: function _getHeaderBuffer() {
      var header = this.header;
      var topicLen = Buffer.byteLength(header.topic, 'utf8');
      var sourceLen = Buffer.byteLength(header.source, 'utf8');
      var targetLen = Buffer.byteLength(header.target, 'utf8');
      var headerLen = 14 + topicLen + sourceLen + targetLen;
      var headerBuf = Buffer.alloc(headerLen);
      var bufStream = new BufferStream(headerBuf);
      bufStream.writeUInt64BE(header.id);
      bufStream.writeUInt8(MSG_TYPE[header.type]);
      bufStream.writeUInt8(MSG_CONTENT_TYPE[header.contentType]);
      bufStream.writeUInt8(header.error || 0);
      bufStream.writeHeaderString(header.topic, topicLen);
      bufStream.writeHeaderString(header.source, sourceLen);
      bufStream.writeHeaderString(header.target, targetLen);
      return bufStream.get();
    } // helper methods

  }, {
    key: "setTopic",
    value: function setTopic(topic) {
      this.header.topic = topic;
    }
  }, {
    key: "setSource",
    value: function setSource(source) {
      this.header.source = source;
    }
  }, {
    key: "setTarget",
    value: function setTarget(target) {
      this.header.target = target;
    }
  }]);
  return RequestMessage;
}(Message);

var ResponseMessage =
/*#__PURE__*/
function (_RequestMessage) {
  (0, _inherits2.default)(ResponseMessage, _RequestMessage);

  function ResponseMessage(id, msgLen, headerLen) {
    var _this;

    (0, _classCallCheck2.default)(this, ResponseMessage);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ResponseMessage).call(this, id, msgLen, headerLen));
    _this.header.type = 'res';
    return _this;
  }

  (0, _createClass2.default)(ResponseMessage, [{
    key: "isError",
    value: function isError(name) {
      var errCode = ErrorCode[name];

      if (errCode === undefined) {
        return false;
      }

      return this.header.error === errCode;
    }
  }, {
    key: "setError",
    value: function setError(code) {
      if (typeof code !== 'number') {
        throw new TypeError('Invalid message error code: ' + code);
      }

      this.header.error = code;
    }
  }]);
  return ResponseMessage;
}(RequestMessage);

var PublishMessage =
/*#__PURE__*/
function (_Message2) {
  (0, _inherits2.default)(PublishMessage, _Message2);

  function PublishMessage(id, msgLen, headerLen) {
    (0, _classCallCheck2.default)(this, PublishMessage);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(PublishMessage).call(this, 'pub', id, msgLen, headerLen));
  }

  (0, _createClass2.default)(PublishMessage, [{
    key: "createFromBuffer",
    value: function createFromBuffer(buf) {
      var headerBuf = buf.slice(8, 8 + this.headerLength);
      var headerBufStream = new BufferStream(headerBuf);
      headerBufStream.offset = 9;
      this.header.contentType = getContentType(headerBufStream.readUInt8());
      this.header.topic = headerBufStream.readHeaderString();
      this.header.target = headerBufStream.readHeaderString();
      this.payloadBuf = buf.slice(8 + this.headerLength, this.messageLength); // this.payload = parsePayloadBuffer(this.payloadBuf, this.header.contentType);

      return this;
    }
  }, {
    key: "_getHeaderBuffer",
    value: function _getHeaderBuffer() {
      var header = this.header;
      var topicLen = Buffer.byteLength(header.topic, 'utf8');
      var targetLen = Buffer.byteLength(header.target, 'utf8');
      var headerLen = 12 + topicLen + targetLen;
      var headerBuf = Buffer.alloc(headerLen);
      var bufStream = new BufferStream(headerBuf);
      bufStream.writeUInt64BE(header.id);
      bufStream.writeUInt8(MSG_TYPE[header.type]);
      bufStream.writeUInt8(MSG_CONTENT_TYPE[header.contentType]);
      bufStream.writeHeaderString(header.topic, topicLen);
      bufStream.writeHeaderString(header.target, targetLen);
      return bufStream.get();
    }
  }, {
    key: "setTopic",
    value: function setTopic(topic) {
      this.header.topic = topic;
    }
  }, {
    key: "setTarget",
    value: function setTarget(target) {
      this.header.target = target;
    }
  }]);
  return PublishMessage;
}(Message);

var SubscribeMessage =
/*#__PURE__*/
function (_Message3) {
  (0, _inherits2.default)(SubscribeMessage, _Message3);

  function SubscribeMessage(id, msgLen, headerLen) {
    (0, _classCallCheck2.default)(this, SubscribeMessage);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(SubscribeMessage).call(this, 'sub', id, msgLen, headerLen));
  }

  (0, _createClass2.default)(SubscribeMessage, [{
    key: "createFromBuffer",
    value: function createFromBuffer(buf) {
      var headerBuf = buf.slice(8, 8 + this.headerLength);
      var headerBufStream = new BufferStream(headerBuf);
      headerBufStream.offset = 9;
      this.header.contentType = getContentType(headerBufStream.readUInt8());
      this.header.topic = headerBufStream.readHeaderString();
      this.payloadBuf = buf.slice(8 + this.headerLength, this.messageLength);
      this.payload = parsePayloadBuffer(this.payloadBuf, this.header.contentType);
      return this;
    }
  }, {
    key: "_getHeaderBuffer",
    value: function _getHeaderBuffer() {
      var header = this.header;
      var topicLen = Buffer.byteLength(header.topic, 'utf8');
      var headerLen = 11 + topicLen;
      var headerBuf = Buffer.alloc(headerLen);
      var bufStream = new BufferStream(headerBuf);
      bufStream.writeUInt64BE(header.id);
      bufStream.writeUInt8(MSG_TYPE[header.type]);
      bufStream.writeUInt8(MSG_CONTENT_TYPE[header.contentType]);
      bufStream.writeHeaderString(header.topic, topicLen);
      return bufStream.get();
    }
  }, {
    key: "setTopic",
    value: function setTopic(topic) {
      this.header.topic = topic;
    }
  }]);
  return SubscribeMessage;
}(Message);

var PushMessage =
/*#__PURE__*/
function (_Message4) {
  (0, _inherits2.default)(PushMessage, _Message4);

  function PushMessage(id, msgLen, headerLen) {
    var _this2;

    (0, _classCallCheck2.default)(this, PushMessage);
    _this2 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(PushMessage).call(this, 'push', id, msgLen, headerLen));
    _this2.payload = [];
    _this2.items = [];
    return _this2;
  }

  (0, _createClass2.default)(PushMessage, [{
    key: "createFromBuffer",
    value: function createFromBuffer(buf) {
      var headerBuf = buf.slice(8, 8 + this.headerLength);
      var headerBufStream = new BufferStream(headerBuf);
      headerBufStream.offset = 9;
      this.header.contentType = getContentType(headerBufStream.readUInt8());
      this.header.topic = headerBufStream.readHeaderString();
      this.header.target = headerBufStream.readHeaderString();
      this.header.itemCount = headerBufStream.readUInt32BE();
      var payloadBuf = buf.slice(8 + this.headerLength, this.messageLength); // No need to parse payload
      // this._parsePayloadBuffer(payloadBuf, this.header.contentType);
      // split payload to item array.

      this.items = this._splitPayloadToItems(payloadBuf);
      return this;
    }
  }, {
    key: "_splitPayloadToItems",
    value: function _splitPayloadToItems(payloadBuf) {
      var itemCount = this.header.itemCount;
      var payloadSize = payloadBuf.length;
      var bufStream = new BufferStream(payloadBuf);
      var items = [];

      for (var i = 0; i < itemCount; i++) {
        var itemLen = bufStream.readUInt32BE();

        if (bufStream.offset + itemLen > payloadSize) {
          throw new RangeError('Payload buffer is smaller than expected.');
        }

        var itemBuf = bufStream.readBuffer(itemLen);
        items.push(itemBuf);
      }

      return items;
    }
  }, {
    key: "_parsePayloadBuffer",
    value: function _parsePayloadBuffer(payloadBuf, contentType) {
      var itemCount = this.header.itemCount;
      var payloadSize = payloadBuf.length;
      var bufStream = new BufferStream(payloadBuf);
      var payload = [];

      if (contentType === 'raw') {
        for (var i = 0; i < itemCount; i++) {
          var itemLen = bufStream.readUInt32BE();

          if (bufStream.offset + itemLen > payloadSize) {
            throw new RangeError('Payload buffer is smaller than expected.');
          }

          var itemBuf = bufStream.readBuffer(itemLen);
          payload.push(itemBuf);
        }
      } else if (contentType === 'json') {
        if (itemCount < 1 || payloadBuf.length === 0) {
          return;
        }

        for (var _i = 0; _i < itemCount; _i++) {
          var _itemLen = bufStream.readUInt32BE();

          if (bufStream.offset + _itemLen > payloadSize) {
            throw new RangeError('Payload buffer is smaller than expected.');
          }

          var _itemBuf = bufStream.readBuffer(_itemLen);

          payload.push(JSON.parse(_itemBuf.toString('utf8')));
        }
      } else {
        for (var _i2 = 0; _i2 < itemCount; _i2++) {
          var _itemLen2 = bufStream.readUInt32BE();

          if (bufStream.offset + _itemLen2 > payloadSize) {
            throw new RangeError('Payload buffer is smaller than expected.');
          }

          var _itemBuf2 = bufStream.readBuffer(_itemLen2);

          payload.push(_itemBuf2.toString('utf8'));
        }
      }

      this.payload = payload;
    }
  }, {
    key: "_getHeaderBuffer",
    value: function _getHeaderBuffer() {
      var header = this.header;
      var topicLen = Buffer.byteLength(header.topic, 'utf8');
      var targetLen = Buffer.byteLength(header.target, 'utf8');
      var headerLen = 16 + topicLen + targetLen;
      var headerBuf = Buffer.alloc(headerLen);
      var bufStream = new BufferStream(headerBuf);
      bufStream.writeUInt64BE(header.id);
      bufStream.writeUInt8(MSG_TYPE[header.type]);
      bufStream.writeUInt8(MSG_CONTENT_TYPE[header.contentType]);
      bufStream.writeHeaderString(header.topic, topicLen);
      bufStream.writeHeaderString(header.target, targetLen);
      bufStream.writeUInt32BE(header.itemCount);
      return bufStream.get();
    }
  }, {
    key: "_getPayloadBuffer",
    value: function _getPayloadBuffer() {
      var payload = this.payload;
      var contentType = this.header.contentType;

      if (!checkContentType(contentType)) {
        throw new TypeError('Unknown payload content type: ' + contentType);
      }

      if (!isIterable(payload)) {
        throw new TypeError('payload should be an iterable object.');
      }

      if (payload.length !== this.header.itemCount) {
        throw new TypeError('payload length should be equal to itemCount.');
      }

      var itemBufs = [];

      if (contentType === 'raw') {
        for (var i in payload) {
          if (!Object.prototype.hasOwnProperty.call(payload, i)) {
            continue;
          }

          var item = payload[i];
          var contentBuf = Buffer.isBuffer(item) ? item : Buffer.from(item);
          var itemBuf = Buffer.allocUnsafe(contentBuf.length + 4);
          itemBuf.writeUInt32BE(contentBuf.length, 0);
          contentBuf.copy(itemBuf, 4);
          itemBufs.push(itemBuf);
        }
      } else if (contentType === 'json') {
        for (var _i3 in payload) {
          if (!Object.prototype.hasOwnProperty.call(payload, _i3)) {
            continue;
          }

          var _item = payload[_i3];

          var _contentBuf = Buffer.from(JSON.stringify(_item), 'utf8');

          var _itemBuf3 = Buffer.allocUnsafe(_contentBuf.length + 4);

          _itemBuf3.writeUInt32BE(_contentBuf.length, 0);

          _contentBuf.copy(_itemBuf3, 4);

          itemBufs.push(_itemBuf3);
        }
      } else if (contentType === 'string') {
        for (var _i4 in payload) {
          if (!Object.prototype.hasOwnProperty.call(payload, _i4)) {
            continue;
          }

          var _item2 = payload[_i4];

          var _contentBuf2 = Buffer.from(_item2);

          var _itemBuf4 = Buffer.allocUnsafe(_contentBuf2.length + 4);

          _itemBuf4.writeUInt32BE(_contentBuf2.length, 0);

          _contentBuf2.copy(_itemBuf4, 4);

          itemBufs.push(_itemBuf4);
        }
      }

      return Buffer.concat(itemBufs);
    } // helper methods

  }, {
    key: "setTopic",
    value: function setTopic(topic) {
      this.header.topic = topic;
    }
  }, {
    key: "setTarget",
    value: function setTarget(target) {
      this.header.target = target;
    }
  }, {
    key: "setItemCount",
    value: function setItemCount(itemCount) {
      this.header.itemCount = itemCount;
    }
  }, {
    key: "setPayload",
    value: function setPayload(data, contentType) {
      if (!isIterable(data)) {
        throw new TypeError('payload should be an iterable object.');
      }

      if (contentType) {
        this.header.contentType = contentType;
      }

      this.payload = data;
      this.header.itemCount = data.length;
    }
  }]);
  return PushMessage;
}(Message);

var PullMessage =
/*#__PURE__*/
function (_Message5) {
  (0, _inherits2.default)(PullMessage, _Message5);

  function PullMessage(id, msgLen, headerLen) {
    (0, _classCallCheck2.default)(this, PullMessage);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(PullMessage).call(this, 'pull', id, msgLen, headerLen));
  }

  (0, _createClass2.default)(PullMessage, [{
    key: "createFromBuffer",
    value: function createFromBuffer(buf) {
      var headerBuf = buf.slice(8, 8 + this.headerLength);
      var headerBufStream = new BufferStream(headerBuf);
      headerBufStream.offset = 9;
      this.header.contentType = getContentType(headerBufStream.readUInt8());
      this.header.topic = headerBufStream.readHeaderString();
      var payloadBuf = buf.slice(8 + this.headerLength, this.messageLength);
      this.payload = parsePayloadBuffer(payloadBuf, this.header.contentType);
      return this;
    }
  }, {
    key: "_getHeaderBuffer",
    value: function _getHeaderBuffer() {
      var header = this.header;
      var topicLen = Buffer.byteLength(header.topic, 'utf8');
      var headerLen = 11 + topicLen;
      var headerBuf = Buffer.alloc(headerLen);
      var bufStream = new BufferStream(headerBuf);
      bufStream.writeUInt64BE(header.id);
      bufStream.writeUInt8(MSG_TYPE[header.type]);
      bufStream.writeUInt8(MSG_CONTENT_TYPE[header.contentType]);
      bufStream.writeHeaderString(header.topic, topicLen);
      return bufStream.get();
    } // helper methods

  }, {
    key: "setTopic",
    value: function setTopic(topic) {
      this.header.topic = topic;
    }
  }]);
  return PullMessage;
}(Message);

var AckMessage =
/*#__PURE__*/
function (_Message6) {
  (0, _inherits2.default)(AckMessage, _Message6);

  function AckMessage(id, msgLen, headerLen) {
    (0, _classCallCheck2.default)(this, AckMessage);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(AckMessage).call(this, 'ack', id, msgLen, headerLen));
  }

  (0, _createClass2.default)(AckMessage, [{
    key: "createFromBuffer",
    value: function createFromBuffer(buf) {
      var headerBuf = buf.slice(8, 8 + this.headerLength);
      var headerBufStream = new BufferStream(headerBuf);
      headerBufStream.offset = 9;
      this.header.topic = headerBufStream.readHeaderString();
      return this;
    }
  }, {
    key: "_getHeaderBuffer",
    value: function _getHeaderBuffer() {
      var header = this.header;
      var topicLen = Buffer.byteLength(header.topic, 'utf8');
      var headerLen = 10 + topicLen;
      var headerBuf = Buffer.alloc(headerLen);
      var bufStream = new BufferStream(headerBuf);
      bufStream.writeUInt64BE(header.id);
      bufStream.writeUInt8(MSG_TYPE[header.type]);
      bufStream.writeHeaderString(header.topic, topicLen);
      return bufStream.get();
    }
  }, {
    key: "setTopic",
    value: function setTopic(topic) {
      this.header.topic = topic;
    }
  }]);
  return AckMessage;
}(Message); // Factory function to create Message object by type.


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
  } else {
    throw new TypeError("Message type:".concat(type, " is not valid."));
  }
}; // Factory function to create Message object from buffer


exports.createFromBuffer = function (buf) {
  // parse new data
  var msgLen = buf.readUInt32BE(0);
  var headerLen = buf.readUInt32BE(4);
  var id = new Int64(buf, 8).toNumber();
  var type = getMessageTypeKey(buf.readUInt8(16, true));
  var msg;

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
  } else {
    throw new TypeError("Message type:".concat(type, " is not valid."));
  }

  msg.createFromBuffer(buf);
  return msg;
};

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("node-int64");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var path = __webpack_require__(13);

var os = __webpack_require__(14);

exports.toNumber = function (x) {
  var value = Number(x);
  return value >= 0 ? x : false;
};

exports.getSocketPath = function (channel) {
  var pipePath = path.resolve(os.tmpdir(), ".fast.mq.".concat(channel)); // use windows named pipe

  if (process.platform === 'win32') {
    pipePath = pipePath.replace(/^\//, '');
    pipePath = pipePath.replace(/\//g, '-');
    pipePath = "\\\\.\\pipe\\".concat(pipePath);
  }

  return pipePath;
};

var pid = process && process.pid ? process.pid : 0;

function uuid() {
  var time = Date.now();
  var last = uuid.last || time;
  uuid.last = time > last ? pid + time : pid + last + 1;
  return uuid.last;
}

exports.uuid = uuid;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var _typeof = __webpack_require__(10);

var assertThisInitialized = __webpack_require__(11);

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return assertThisInitialized(self);
}

module.exports = _possibleConstructorReturn;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var setPrototypeOf = __webpack_require__(12);

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}

module.exports = _inherits;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  REGISTER_FAIL: 0x01,
  TARGET_CHANNEL_NONEXIST: 0x02,
  TOPIC_NONEXIST: 0x03
};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

function _typeof2(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof2 = function _typeof2(obj) {
      return typeof obj;
    };
  } else {
    _typeof2 = function _typeof2(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof2(obj);
}

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;

/***/ }),
/* 12 */
/***/ (function(module, exports) {

function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(1));

var _createClass2 = _interopRequireDefault(__webpack_require__(2));

var Int64 = __webpack_require__(4);

var BufferStream =
/*#__PURE__*/
function () {
  function BufferStream(a1) {
    (0, _classCallCheck2.default)(this, BufferStream);

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

  (0, _createClass2.default)(BufferStream, [{
    key: "get",
    value: function get() {
      return this._buf;
    }
  }, {
    key: "readUInt8",
    value: function readUInt8() {
      var val = this._buf.readUInt8(this._offset);

      this._offset += 1;
      return val;
    }
  }, {
    key: "readUInt16BE",
    value: function readUInt16BE() {
      var val = this._buf.readUInt16BE(this._offset);

      this._offset += 2;
      return val;
    }
  }, {
    key: "readUInt32BE",
    value: function readUInt32BE() {
      var val = this._buf.readUInt32BE(this._offset);

      this._offset += 4;
      return val;
    }
  }, {
    key: "readUInt64BE",
    value: function readUInt64BE() {
      var val = new Int64(this._buf, this._offset).toNumber();
      this._offset += 8;
      return val;
    }
  }, {
    key: "readString",
    value: function readString(length) {
      var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'utf8';

      var val = this._buf.toString(encoding, this._offset, this._offset + length);

      this._offset += length;
      return val;
    }
  }, {
    key: "readBuffer",
    value: function readBuffer(length) {
      var val = this._buf.slice(this._offset, this._offset + length);

      this._offset += length;
      return val;
    }
  }, {
    key: "writeUInt8",
    value: function writeUInt8(val) {
      this._offset = this._buf.writeUInt8(val, this._offset);
    }
  }, {
    key: "writeUInt16BE",
    value: function writeUInt16BE(val) {
      this._offset = this._buf.writeUInt16BE(val, this._offset);
    }
  }, {
    key: "writeUInt32BE",
    value: function writeUInt32BE(val) {
      this._offset = this._buf.writeUInt32BE(val, this._offset);
    }
  }, {
    key: "writeUInt64BE",
    value: function writeUInt64BE(val) {
      var int64Val = new Int64(val);
      int64Val.copy(this._buf, this._offset);
      this._offset += 8;
    }
  }, {
    key: "writeString",
    value: function writeString(str, length) {
      var bufLen = length === undefined ? str.length : length;
      this._offset += this._buf.write(str, this._offset, bufLen);
    }
  }, {
    key: "writeBuffer",
    value: function writeBuffer(buf, start, end) {
      this._offset += buf.copy(this._buf, this._offset, start, end);
    }
  }, {
    key: "readHeaderString",
    value: function readHeaderString() {
      var len = this.readUInt8();
      return this.readString(len);
    }
  }, {
    key: "writeHeaderString",
    value: function writeHeaderString(str, length) {
      var bufLen = length === undefined ? str.length : length;
      this.writeUInt8(bufLen);
      this.writeString(str, bufLen);
    }
  }, {
    key: "offset",
    get: function get() {
      return this._offset;
    },
    set: function set(val) {
      this._offset = val;
    }
  }]);
  return BufferStream;
}();

module.exports = BufferStream;

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("eventemitter3");

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(1));

var _createClass2 = _interopRequireDefault(__webpack_require__(2));

var Message = __webpack_require__(3);

var Response =
/*#__PURE__*/
function () {
  function Response(reqMsg, socket) {
    (0, _classCallCheck2.default)(this, Response);
    this._reqMsg = reqMsg;
    this.socket = socket;
    this._msg = Message.create('res', reqMsg.header.id); // swap target and source, fill topic and contentType

    var reqHeader = reqMsg.header;

    this._msg.setTopic(reqHeader.topic);

    this._msg.setSource(reqHeader.target);

    this._msg.setTarget(reqHeader.source);

    this._msg.setContentType(reqHeader.contentType);
  }

  (0, _createClass2.default)(Response, [{
    key: "header",
    value: function header(val) {
      if (val === undefined) {
        return this._msg.header;
      }

      return this._msg.header[val];
    }
  }, {
    key: "setSource",
    value: function setSource(source) {
      this._msg.setSource(source);
    }
  }, {
    key: "setTarget",
    value: function setTarget(target) {
      this._msg.setTarget(target);
    }
  }, {
    key: "setError",
    value: function setError(code) {
      this._msg.setError(code);
    }
  }, {
    key: "setContentType",
    value: function setContentType(type) {
      this._msg.setContentType(type);
    }
  }, {
    key: "send",
    value: function send(data, contentType) {
      if (contentType) {
        this._msg.setContentType(contentType);
      }

      this._msg.setPayload(data);

      this.socket.write(this._msg.getBuffer());
    }
  }]);
  return Response;
}();

module.exports = Response;

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("bluebird");

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = require("net");

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(1));

var _createClass2 = _interopRequireDefault(__webpack_require__(2));

var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(6));

var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(7));

var _inherits2 = _interopRequireDefault(__webpack_require__(8));

var Message = __webpack_require__(3);

var EventEmitter = __webpack_require__(16);

var MessageReceiver =
/*#__PURE__*/
function (_EventEmitter) {
  (0, _inherits2.default)(MessageReceiver, _EventEmitter);

  function MessageReceiver(messageHandler) {
    var _this;

    (0, _classCallCheck2.default)(this, MessageReceiver);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(MessageReceiver).call(this));
    _this._recvBytes = 0;
    _this._expectMsgSize = 0;
    _this._recvBuf = null;
    _this._messageHandler = messageHandler;
    return _this;
  }

  (0, _createClass2.default)(MessageReceiver, [{
    key: "recv",
    value: function recv(chunk, socket) {
      var reminingBytes = chunk.length;
      var chunkOffset = 0;

      try {
        while (reminingBytes > 0) {
          if (this._recvBytes === 0) {
            // read message length
            this._expectMsgSize = chunk.readUInt32BE(chunkOffset);
            this._recvBuf = Buffer.allocUnsafe(this._expectMsgSize);
            var sourceEnd = reminingBytes > this._expectMsgSize ? this._expectMsgSize : reminingBytes;
            chunk.copy(this._recvBuf, 0, chunkOffset, chunkOffset + sourceEnd);
            this._recvBytes += sourceEnd;
            chunkOffset += sourceEnd;
            reminingBytes -= sourceEnd;
          } else if (this._recvBytes < this._expectMsgSize) {
            var msgReminingBytes = this._expectMsgSize - this._recvBytes;

            var _sourceEnd = reminingBytes > msgReminingBytes ? msgReminingBytes : reminingBytes;

            chunk.copy(this._recvBuf, this._recvBytes, chunkOffset, chunkOffset + _sourceEnd);
            this._recvBytes += _sourceEnd;
            chunkOffset += _sourceEnd;
            reminingBytes -= _sourceEnd;
          }

          if (this._recvBytes >= this._expectMsgSize) {
            this._recvBytes -= this._expectMsgSize;
            this._expectMsgSize = 0;
            var msg = Message.createFromBuffer(this._recvBuf);

            this._messageHandler(msg, this._recvBuf, socket);
          }
        }
      } catch (err) {
        this.emit('error', err);
      }
    }
  }]);
  return MessageReceiver;
}(EventEmitter);

module.exports = MessageReceiver;

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("glob-to-regexp");

/***/ }),
/* 23 */,
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(1));

var _createClass2 = _interopRequireDefault(__webpack_require__(2));

var promiseImpl = __webpack_require__(19);

global.Promise = promiseImpl;

var net = __webpack_require__(20);

var fs = __webpack_require__(25);

var EventEmitter = __webpack_require__(16);

var QueueManager = __webpack_require__(26);

var Message = __webpack_require__(3);

var Response = __webpack_require__(17);

var MessageReceiver = __webpack_require__(21);

var ChannelManager = __webpack_require__(31);

var ErrorCode = __webpack_require__(9);

var common = __webpack_require__(5);

var getSocketPath = common.getSocketPath;
var toNumber = common.toNumber;

var util = __webpack_require__(18);

var debug = util.debuglog('fastmq');

var Server =
/*#__PURE__*/
function () {
  function Server(options) {
    (0, _classCallCheck2.default)(this, Server);
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

  (0, _createClass2.default)(Server, [{
    key: "_messageHandler",
    value: function _messageHandler(msg, rawBuf, socket) {
      var _this = this;

      var header = msg.header;

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
            var res = new Response(msg, socket);

            var targetChannel = this._channels.findResponseTopic(this.channel, msg.header.topic);

            if (!targetChannel) {
              res.setError(ErrorCode.TOPIC_NONEXIST);
              res.send('', 'json');
            } else {
              process.nextTick(function () {
                _this._requestEvent.emit(header.topic, msg, res);
              });
            }
          }
        }
      } else if (msg.isResponse()) {
        // Response message
        if (header.target !== this.channel) {
          this._forwardResponseMessage(msg, rawBuf);
        } else {
          process.nextTick(function () {
            _this._responseEvent.emit(msg.getEventName(), msg);
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
  }, {
    key: "_prepareListeners",
    value: function _prepareListeners() {
      this._server.on('listening', function () {});

      this._server.on('connection', this._handleConnection);

      this._server.on('error', this._handleServerError);

      this._msgReceiver.on('error', function (err) {
        debug('Message Receiver error:', err.stack);
      }); // this._msgReceiver.on('message', this._messageHandler);

    }
  }, {
    key: "_setupRequestHandlers",
    value: function _setupRequestHandlers() {
      var _this2 = this;

      // setup internal request handlers
      this._requestHandlers.register = function (msg, res) {
        var srcChannel = msg.header.source;
        var socket = res.socket;

        if (_this2._channels.has(srcChannel)) {
          debug("Channel '".concat(srcChannel, "' already exist."));
          res.setError(ErrorCode.REGISTER_FAIL);
        } else {
          _this2._channels.register(srcChannel, socket);

          debug("Register channel '".concat(srcChannel, "'"));
        }

        res.send('', 'json');
      };

      this._requestHandlers.addResponseListener = function (msg, res) {
        var name = msg.header.source;

        var channel = _this2._channels.addResponse(name, msg.payload.topic);

        if (!channel) {
          res.setError(ErrorCode.REGISTER_FAIL);
        }

        res.send({
          result: channel ? true : false
        }, 'json');
      };

      this._requestHandlers.addPullListener = function (msg, res) {
        var payload = msg.payload;
        var name = msg.header.source;

        var channel = _this2._channels.addPull(name, payload.topic, payload.options);

        if (!channel) {
          res.setError(ErrorCode.REGISTER_FAIL);
        }

        var queue = _this2._queueManager.get('pull', payload.topic);

        queue.addChannel(channel);
        res.send({
          result: channel ? true : false
        }, 'json');
      };

      this._requestHandlers.addSubscribeListener = function (msg, res) {
        var payload = msg.payload;
        var name = msg.header.source;

        var channel = _this2._channels.addSubscribe(name, payload.topic, payload.options);

        if (!channel) {
          res.setError(ErrorCode.REGISTER_FAIL);
        }

        var queue = _this2._queueManager.get('sub', payload.topic);

        queue.addChannel(channel);
        res.send({
          result: channel ? true : false
        }, 'json');
      };
    }
  }, {
    key: "start",
    value: function start() {
      var _this3 = this;

      if (!this._server) {
        this._server = net.createServer();

        this._prepareListeners();

        this._setupRequestHandlers();
      }

      return new Promise(function (resolve, reject) {
        _this3._server.listen(_this3._serverOptions, function () {
          resolve(_this3);
        });
      });
    }
  }, {
    key: "stop",
    value: function stop() {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        _this4._shutdown();

        _this4._server.close(function () {
          resolve(_this4);
        });
      });
    } // Send request to client channel

  }, {
    key: "request",
    value: function request(target, topic) {
      var _this5 = this;

      var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var contentType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'json';
      return new Promise(function (resolve, reject) {
        if (!_this5._channels.contains(target)) {
          reject(new Error("Target channel[".concat(target, "] doesn't exist.")));
          return;
        }

        try {
          var msg = Message.create('req');
          msg.setTopic(topic);
          msg.setSource(_this5.channel);
          msg.setTarget(target);
          msg.setContentType(contentType);
          msg.setPayload(data);
          var msgBuf = msg.getBuffer();

          _this5._client.write(msgBuf); // get response data


          _this5._responseEvent.once(msg.getEventName(), function (resMsg) {
            resolve(resMsg);
          });
        } catch (err) {
          reject(err);
        }
      });
    }
  }, {
    key: "response",
    value: function response(topic, listener) {
      this._channels.addResponse(this.channel, topic);

      this._requestEvent.on(topic, function (msg, res) {
        listener(msg, res);
      });

      return this;
    }
  }, {
    key: "_forwardRequestMessage",
    value: function _forwardRequestMessage(reqMsg, rawReqBuf, sourceSocket) {
      var targetChannel = this._channels.findResponseTopic(reqMsg.header.target, reqMsg.header.topic);

      if (!targetChannel) {
        var res = new Response(reqMsg, sourceSocket); // set source to this server channel

        res.setSource(this.channel); // set target channel doesn't exist error code

        res.setError(ErrorCode.TARGET_CHANNEL_NONEXIST);
        res.send('', 'json');
        return;
      } // forward raw request buffer to target


      targetChannel.socket.write(rawReqBuf);
    }
  }, {
    key: "_forwardResponseMessage",
    value: function _forwardResponseMessage(resMsg, rawResBuf) {
      var target = resMsg.header.target;

      var targetChannel = this._channels.get(target);

      if (!targetChannel) {
        debug("The target channel '".concat(target, "' of Response message does not exist."));
        return;
      } // forward raw response buffer to target


      targetChannel.socket.write(rawResBuf);
    }
  }, {
    key: "_processInternalRequest",
    value: function _processInternalRequest(msg, socket) {
      var header = msg.header;
      var topic = header.topic;

      if (this._requestHandlers.hasOwnProperty(topic)) {
        var res = new Response(msg, socket);

        this._requestHandlers[topic].call(this, msg, res);

        return true;
      }

      return false;
    }
  }, {
    key: "_handleConnection",
    value: function _handleConnection(socket) {
      var _this6 = this;

      this._sockets.push(socket);

      socket.on('data', function (chunk) {
        _this6._msgReceiver.recv(chunk, socket);
      });
      /* eslint-disable handle-callback-err */

      socket.on('error', function (err) {
        socket.unref();
      });
      /* eslint-enable handle-callback-err */

      socket.on('close', function () {
        // remove socket from socket pool
        var socketIndex = _this6._sockets.indexOf(socket);

        if (socketIndex !== -1) {
          _this6._sockets.splice(socketIndex, 1);
        } // unregister channel


        var channel = _this6._channels.unregisterBySocket(socket);

        if (channel) {
          _this6._queueManager.removeChannels(channel);

          debug("Un-register channel '".concat(channel, "'"));
        }
      });
    }
  }, {
    key: "_shutdown",
    value: function _shutdown() {
      this._sockets.forEach(function (socket) {
        if (socket && socket.destroy) {
          socket.destroy();
        }
      });

      this._sockets = [];

      this._channels.unregisterAll();
    }
  }, {
    key: "_handleServerError",
    value: function _handleServerError(err) {
      var _this7 = this;

      if (err.code === 'EADDRINUSE') {
        if (this._serverOptions.path) {
          this._server.close();

          fs.unlinkSync(this._serverOptions.path);
        } else {
          this._server.close();
        }

        setTimeout(function () {
          _this7._server.listen(_this7._serverOptions);
        }, 300);
      } else {
        debug('Message broker server got error:', error.stack);
      }
    }
  }]);
  return Server;
}(); // create(name)
// create(name, port[, host])


exports.create = function () {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (arguments.length < 1) {
    throw new Error('Invalid create argument, it needs at least one argument.');
  }

  var options = {}; // get channel name

  if (args[0] === null || typeof args[0] !== 'string') {
    throw new TypeError('Invalid channel name, channel name must be a string type.');
  } else {
    options.name = args[0];
  }

  if (arguments.length > 1) {
    if (typeof args[1] === 'number' && toNumber(args[1]) !== false) {
      // create(name, port[, host])
      options.port = toNumber(args[1]);

      if (arguments.length > 2 && typeof args[2] === 'string') {
        options.host = args[2];
      }
    }
  }

  if (typeof options.port === 'number' && options.host === undefined) {
    options.host = 'localhost';
  }

  return new Server(options);
};

/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

var _regenerator = _interopRequireDefault(__webpack_require__(27));

var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(29));

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(1));

var _createClass2 = _interopRequireDefault(__webpack_require__(2));

var Queue = __webpack_require__(30);

var globToRegExp = __webpack_require__(22);

var generateUuid = __webpack_require__(5).uuid;

var Message = __webpack_require__(3);

var util = __webpack_require__(18);

var debug = util.debuglog('fastmq');

function getChannelHandler(channel, topic) {
  if (!channel.handlers.hasOwnProperty(topic)) {
    return null;
  }

  return channel.handlers[topic];
}

function createMessage(type, item, topic) {
  var msg = Message.create(type, item.id);
  msg.setContentType(item.contentType);
  msg.setTopic(topic);
  msg.setPayloadBuf(item.data);
  return msg;
}

var TaskQueue =
/*#__PURE__*/
function () {
  function TaskQueue(type, topic) {
    (0, _classCallCheck2.default)(this, TaskQueue);
    this._type = type;
    this._topic = topic;
    this._channels = [];
    this._queue = new Queue(16);
    this._nonAckTasks = {};
    this._channelIndex = 0;
  }

  (0, _createClass2.default)(TaskQueue, [{
    key: "addChannel",
    value: function addChannel(channel) {
      var _this = this;

      var handler = getChannelHandler(channel, this._topic);

      if (!handler) {
        return false;
      }

      var channelName = channel.name;
      channel.socket.on('close', function () {
        debug("TaskQueue: socket.close, channel: ".concat(channelName));

        if (handler.type === 'pull') {
          _this.redeliver(channelName);
        }

        _this.removeChannel(channelName);
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

      return true;
    }
  }, {
    key: "removeChannel",
    value: function removeChannel(name) {
      var len = this._channels.length;

      for (var i = len - 1; i >= 0; i--) {
        var channel = this._channels[i];

        if (channel.name === name) {
          this._channels.splice(i, 1);
        }
      }

      if (this._channelIndex >= this._channels.length) {
        this._channelIndex = 0;
      }
    }
  }, {
    key: "enqueue",
    value: function enqueue(data, targetRegExp, contentType) {
      var task = {
        id: generateUuid(),
        targetRegExp: targetRegExp,
        contentType: contentType,
        data: data
      };

      this._queue.enqueue(task);
    }
  }, {
    key: "process",
    value: function process() {
      if (this._type === 'pull') {
        this._processPullMessages();
      } else if (this._type === 'sub') {
        this._processSubscribeMessages();
      }
    }
  }, {
    key: "redeliver",
    value: function redeliver(channelName) {
      for (var id in this._nonAckTasks) {
        if (!Object.prototype.hasOwnProperty.call(this._nonAckTasks, id)) {
          continue;
        }

        var task = this._nonAckTasks[id];

        if (task.channel === channelName) {
          var redeliverTask = {
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
  }, {
    key: "handleAck",
    value: function handleAck(id) {
      var tasks = this._nonAckTasks;

      if (!tasks.hasOwnProperty(id)) {
        return false;
      }

      var item = tasks[id]; // debug('Handle Ack, item id:' + id);

      var len = this._channels.length;

      for (var i = 0; i < len; i++) {
        if (this._channels[i].name === item.channel) {
          this._channels[i].availCount++;
          break;
        }
      }

      delete tasks[id]; // run process again when receive acknowledge

      this.process();
      return true;
    }
  }, {
    key: "_dropTask",
    value: function _dropTask() {
      var taskQueue = this._queue;
      var curItem = taskQueue.peekFront();

      if (!this._channelMatch(curItem.targetRegExp)) {
        debug('Drop task in queue:', curItem); // drop task when no channel matches current task item

        taskQueue.dequeue();
        return true;
      }

      return false;
    }
  }, {
    key: "_processPullMessages",
    value: function _processPullMessages() {
      var taskQueue = this._queue;
      var queueIsEmpty = false; // const channelAvailable = this._channelAvailable('pull');
      // debug(`Channel available: ${channelAvailable}, queue size: ${taskQueue.length}`);

      var loopCount = 0;
      var maxLoopCount = taskQueue.length * (this._channels.length ? this._channels.length * 2 : 2);

      while (!taskQueue.isEmpty() && this._channelAvailable('pull')) {
        if (loopCount++ >= maxLoopCount) {
          warn('Exceed max. loop trying count:' + maxLoopCount);
          break;
        }

        if (this._dropTask()) {
          continue;
        }

        var curIndex = this._channelIndex;
        var channel = this._channels[curIndex];
        var availCount = channel.availCount; // debug(`current channel name: ${channel.name}, type: ${channel.type} availCount: ${availCount}, queue size: ${taskQueue.length}`);

        for (var i = 0; i < availCount; i++) {
          queueIsEmpty = taskQueue.isEmpty();

          if (queueIsEmpty) {
            break;
          } // dequeue task and write pull messsage to channel


          var item = taskQueue.dequeue();
          var msg = createMessage('pull', item, this._topic);
          channel.socket.write(msg.getBuffer());
          channel.availCount--; // add current item to non-ack. task

          var nonAckItem = {
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
  }, {
    key: "_processSubscribeMessages",
    value: function _processSubscribeMessages() {
      var taskQueue = this._queue;
      debug("Process SUB messages, queue size: ".concat(taskQueue.length));

      while (!taskQueue.isEmpty()) {
        var item = taskQueue.dequeue();

        var subChannels = this._getSubscribeChannels(item.targetRegExp);

        var subChannelLength = subChannels.length;
        debug("item target: ".concat(item.targetRegExp.toString(), ", subChannelLength: ").concat(subChannelLength));
        var msg = createMessage('sub', item, this._topic);

        for (var i = 0; i < subChannelLength; i++) {
          var channel = subChannels[i];
          debug('socket write');
          channel.socket.write(msg.getBuffer());
        }
      }
    }
  }, {
    key: "_nextChannel",
    value: function _nextChannel() {
      var curIndex = this._channelIndex;
      this._channelIndex = curIndex + 1 < this._channels.length ? curIndex + 1 : 0;
    }
  }, {
    key: "_channelMatch",
    value: function _channelMatch(regexp) {
      var len = this._channels.length;
      var match = false;

      for (var i = 0; i < len; i++) {
        var channel = this._channels[i];

        if (regexp.test(channel.name)) {
          match = true;
          break;
        }
      }

      return match;
    }
  }, {
    key: "_channelAvailable",
    value: function _channelAvailable(type) {
      var len = this._channels.length;
      var avail = false;

      for (var i = 0; i < len; i++) {
        var channel = this._channels[i];

        if (channel.type === type && channel.availCount > 0) {
          avail = true;
          break;
        }
      }

      return avail;
    }
  }, {
    key: "_getSubscribeChannels",
    value: function _getSubscribeChannels(regexp) {
      var len = this._channels.length;
      var channels = [];

      for (var i = 0; i < len; i++) {
        var channel = this._channels[i];

        if (channel.type === 'subscribe' && regexp.test(channel.name)) {
          channels.push(channel);
        }
      }

      return channels;
    }
  }]);
  return TaskQueue;
}();

var QueueManager =
/*#__PURE__*/
function () {
  function QueueManager() {
    (0, _classCallCheck2.default)(this, QueueManager);
    this._taskQueues = {};
  }

  (0, _createClass2.default)(QueueManager, [{
    key: "get",
    value: function get(type, topic) {
      // debug(`QueueManager get, type=${type} topic=${topic}`);
      if (!this._taskQueues.hasOwnProperty(topic)) {
        this._taskQueues[topic] = {};
      }

      if (!this._taskQueues[topic].hasOwnProperty(type)) {
        this._taskQueues[topic][type] = new TaskQueue(type, topic);
      }

      return this._taskQueues[topic][type];
    }
  }, {
    key: "removeTopic",
    value: function removeTopic(topic) {
      if (this._taskQueues.hasOwnProperty(topic)) {
        delete this._taskQueues[topic];
      }
    }
  }, {
    key: "removeChannels",
    value: function removeChannels(name) {
      for (var topic in this._taskQueues) {
        if (!Object.prototype.hasOwnProperty.call(this._taskQueues, topic)) {
          continue;
        }

        var topicQueue = this._taskQueues[topic];

        for (var taskType in topicQueue) {
          if (!Object.prototype.hasOwnProperty.call(topicQueue, taskType)) {
            continue;
          }

          topicQueue[taskType].removeChannel(name);
        }
      }
    }
  }, {
    key: "handleAck",
    value: function handleAck(msg) {
      var header = msg.header;

      if (!this._taskQueues.hasOwnProperty(header.topic)) {
        return false;
      } // only push/pull task nees to handle acknowledge


      if (this._taskQueues[header.topic].hasOwnProperty('pull')) {
        return this._taskQueues[header.topic].pull.handleAck(header.id);
      }

      return false;
    }
  }, {
    key: "processPublishTask",
    value: function () {
      var _processPublishTask = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(target, topic, payload, contentType) {
        var queue, targetRegExp;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                queue = this.get('sub', topic);
                targetRegExp = globToRegExp(target);
                _context.next = 4;
                return queue.enqueue(payload, targetRegExp, contentType);

              case 4:
                _context.next = 6;
                return queue.process();

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function processPublishTask(_x, _x2, _x3, _x4) {
        return _processPublishTask.apply(this, arguments);
      }

      return processPublishTask;
    }()
  }, {
    key: "processPushTasks",
    value: function () {
      var _processPushTasks = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2(target, topic, items, contentType) {
        var queue, itemCount, targetRegExp, i;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                queue = this.get('pull', topic);
                itemCount = items.length;
                targetRegExp = globToRegExp(target);
                i = 0;

              case 4:
                if (!(i < itemCount)) {
                  _context2.next = 10;
                  break;
                }

                _context2.next = 7;
                return queue.enqueue(items[i], targetRegExp, contentType);

              case 7:
                i++;
                _context2.next = 4;
                break;

              case 10:
                _context2.next = 12;
                return queue.process();

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function processPushTasks(_x5, _x6, _x7, _x8) {
        return _processPushTasks.apply(this, arguments);
      }

      return processPushTasks;
    }()
  }]);
  return QueueManager;
}();

module.exports = QueueManager;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(28);

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = require("regenerator-runtime");

/***/ }),
/* 29 */
/***/ (function(module, exports) {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;

/***/ }),
/* 30 */
/***/ (function(module, exports) {

module.exports = require("double-ended-queue");

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(1));

var _createClass2 = _interopRequireDefault(__webpack_require__(2));

var globToRegExp = __webpack_require__(22);

var util = __webpack_require__(18);

var debug = util.debuglog('fastmq');

function getRandomInt(min, max) {
  var minVal = Math.ceil(min);
  var maxVal = Math.floor(max);
  return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}

var ChannelManager =
/*#__PURE__*/
function () {
  function ChannelManager() {
    (0, _classCallCheck2.default)(this, ChannelManager);
    this._channels = {};
  }

  (0, _createClass2.default)(ChannelManager, [{
    key: "has",
    value: function has(name) {
      return this._channels.hasOwnProperty(name);
    }
  }, {
    key: "contains",
    value: function contains(nameGlob) {
      var re = globToRegExp(nameGlob);

      for (var key in this._channels) {
        if (re.test(key)) {
          return true;
        }
      }

      return false;
    }
  }, {
    key: "register",
    value: function register(name, socket) {
      if (this.has(name)) {
        delete this._channels[name];
      }

      this._channels[name] = {
        name: name,
        socket: socket,
        handlers: {}
      };
    }
  }, {
    key: "unregister",
    value: function unregister(name) {
      debug('unregister channel name: ' + name);
      delete this._channels[name];
    }
  }, {
    key: "unregisterBySocket",
    value: function unregisterBySocket(socket) {
      var removeChannelName;

      for (var key in this._channels) {
        if (this._channels[key].socket === socket) {
          this.unregister(key);
          removeChannelName = key;
          break;
        }
      }

      return removeChannelName;
    }
  }, {
    key: "unregisterAll",
    value: function unregisterAll() {
      var _this = this;

      Object.keys(this._channels).forEach(function (name) {
        _this.unregister(name);
      });
    }
  }, {
    key: "addResponse",
    value: function addResponse(name, topic, options) {
      return this._add('response', name, topic, options);
    }
  }, {
    key: "addPull",
    value: function addPull(name, topic, options) {
      return this._add('pull', name, topic, options);
    }
  }, {
    key: "addSubscribe",
    value: function addSubscribe(name, topic, options) {
      return this._add('subscribe', name, topic, options);
    }
  }, {
    key: "get",
    value: function get(name) {
      return this.has(name) ? this._channels[name] : null;
    }
  }, {
    key: "find",
    value: function find(nameGlob) {
      var channels = [];
      var re = globToRegExp(nameGlob);

      for (var key in this._channels) {
        if (re.test(key)) {
          channels.push(channel);
        }
      }

      return channels;
    }
  }, {
    key: "findResponseTopic",
    value: function findResponseTopic(nameGlob, topic) {
      // Request/Response pattern is 1-1,
      // so we need to return only one channel
      var channels = this._findTopic('response', nameGlob, topic); // debug(`findResponseTopic name:${nameGlob} topic: ${topic}, results: ${channels.length}`);


      if (channels.length === 0) {
        return null;
      }

      if (channels.length === 1) {
        return channels[0];
      } // choose random one


      return channels[getRandomInt(0, channles.length - 1)];
    }
  }, {
    key: "findPullTopic",
    value: function findPullTopic(nameGlob, topic) {
      return this._findTopic('pull', nameGlob, topic);
    }
  }, {
    key: "findSubscribeTopic",
    value: function findSubscribeTopic(nameGlob, topic) {
      return this._findTopic('subscribe', nameGlob, topic);
    }
  }, {
    key: "_add",
    value: function _add(type, name, topic, options) {
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
  }, {
    key: "_findTopic",
    value: function _findTopic(type, nameGlob, topic) {
      var channels = [];
      var re = globToRegExp(nameGlob);

      for (var key in this._channels) {
        if (re.test(key) || key === nameGlob) {
          var _channel = this._channels[key];
          var handlers = _channel.handlers;

          if (handlers.hasOwnProperty(topic) && handlers[topic].type === type) {
            // debug(`got channel ${key} by type: ${type}, topic: ${topic}`);
            channels.push(_channel);
          }
        }
      }

      return channels;
    }
  }]);
  return ChannelManager;
}();

module.exports = ChannelManager;

/***/ })
/******/ ]);