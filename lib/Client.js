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
  ack: 7,
  sreq: 0xff
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
    key: "isServerRequest",
    value: function isServerRequest() {
      return this.header.type === 'sreq';
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

  function RequestMessage(id, msgLen, headerLen, type) {
    (0, _classCallCheck2.default)(this, RequestMessage);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(RequestMessage).call(this, type ? type : 'req', id, msgLen, headerLen));
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

var ServerRequestMessage =
/*#__PURE__*/
function (_RequestMessage) {
  (0, _inherits2.default)(ServerRequestMessage, _RequestMessage);

  function ServerRequestMessage(id, msgLen, headerLen) {
    (0, _classCallCheck2.default)(this, ServerRequestMessage);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ServerRequestMessage).call(this, id, msgLen, headerLen, 'sreq'));
  }

  return ServerRequestMessage;
}(RequestMessage);

var ResponseMessage =
/*#__PURE__*/
function (_RequestMessage2) {
  (0, _inherits2.default)(ResponseMessage, _RequestMessage2);

  function ResponseMessage(id, msgLen, headerLen) {
    (0, _classCallCheck2.default)(this, ResponseMessage);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ResponseMessage).call(this, id, msgLen, headerLen, 'res')); // this.header.type = 'res';
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
    var _this;

    (0, _classCallCheck2.default)(this, PushMessage);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(PushMessage).call(this, 'push', id, msgLen, headerLen));
    _this.payload = [];
    _this.items = [];
    return _this;
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
  } else if (type === 'sreq') {
    return new ServerRequestMessage(id);
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
  } else if (type === 'sreq') {
    msg = new ServerRequestMessage(id, msgLen, headerLen);
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

module.exports = require("lodash");

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("net");

/***/ }),
/* 22 */
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
/* 23 */,
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(0);

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(1));

var _createClass2 = _interopRequireDefault(__webpack_require__(2));

var promiseImpl = __webpack_require__(19);

global.Promise = promiseImpl;

var _ = __webpack_require__(20);

var net = __webpack_require__(21);

var EventEmitter = __webpack_require__(16);

var Message = __webpack_require__(3);

var Response = __webpack_require__(17);

var MessageReceiver = __webpack_require__(22);

var util = __webpack_require__(18);

var common = __webpack_require__(5);

var getSocketPath = common.getSocketPath;
var debug = util.debuglog('fastmq');

var Channel =
/*#__PURE__*/
function () {
  function Channel(channelName, clientSocket) {
    var _this = this;

    (0, _classCallCheck2.default)(this, Channel);
    // public properties
    this.channel = channelName; // private properties

    this._socket = clientSocket;
    this._requestEvent = new EventEmitter();
    this._responseEvent = new EventEmitter();
    this._subEvent = new EventEmitter();
    this._pullEvent = new EventEmitter();
    this._errorEvent = new EventEmitter();
    this._messageHandler = this._messageHandler.bind(this);
    this._msgReceiver = new MessageReceiver(this._messageHandler);

    this._msgReceiver.on('error', function (err) {
      debug('Message receiver got error:', err.stack);

      _this._errorEvent.emit('error', err);
    });

    this._socket.on('data', function (chunk) {
      _this._msgReceiver.recv(chunk, _this._socket);
    });

    this._socket.on('error', function (err) {
      _this._errorEvent.emit('error', err);
    });
  }

  (0, _createClass2.default)(Channel, [{
    key: "_messageHandler",
    value: function _messageHandler(msg, rawBuf, socket) {
      var _this2 = this;

      if (msg.isRequest()) {
        var res = new Response(msg, socket);
        process.nextTick(function () {
          _this2._requestEvent.emit(msg.header.topic, msg, res);
        });
      } else if (msg.isResponse()) {
        process.nextTick(function () {
          _this2._responseEvent.emit(msg.getEventName(), msg);
        });
      } else if (msg.isPull()) {
        // debug('Got pull message\n# Header:\n', msg.header, '\n# Payload:', msg.payload);
        process.nextTick(function () {
          _this2._pullEvent.emit(msg.header.topic, msg);
        });
      } else if (msg.isSubscribe()) {
        // debug('Got subscribe message\n# Header:\n', msg.header, '\n# Payload:', msg.payload);
        process.nextTick(function () {
          _this2._subEvent.emit(msg.header.topic, msg);
        });
      }
    }
  }, {
    key: "onError",
    value: function onError(listener) {
      if (listener === undefined || typeof listener !== 'function') {
        throw new TypeError('Listener must be a function.');
      }

      this._errorEvent.on('error', listener);
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      if (this._socket) {
        this._socket.destroy();

        this._socket.unref();
      }
    }
  }, {
    key: "request",
    value: function request(target, topic) {
      var _this3 = this;

      var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var contentType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'json';
      return new Promise(function (resolve, reject) {
        try {
          var msg = Message.create('req');
          msg.setTopic(topic);
          msg.setSource(_this3.channel);
          msg.setTarget(target);
          msg.setContentType(contentType);
          msg.setPayload(data);
          var msgBuf = msg.getBuffer();

          _this3._socket.write(msgBuf); // get response data


          _this3._responseEvent.once(msg.getEventName(), function (resMsg) {
            resolve(resMsg);
          });
        } catch (err) {
          reject(err);
        }
      });
    }
  }, {
    key: "_serverRequest",
    value: function _serverRequest(topic) {
      var _this4 = this;

      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var contentType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'json';
      return new Promise(function (resolve, reject) {
        try {
          var msg = Message.create('sreq');
          msg.setTopic(topic);
          msg.setSource(_this4.channel);
          msg.setTarget('');
          msg.setContentType(contentType);
          msg.setPayload(data);
          var msgBuf = msg.getBuffer();

          _this4._socket.write(msgBuf); // get response data


          _this4._responseEvent.once(msg.getEventName(), function (resMsg) {
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
      var _this5 = this;

      this._requestEvent.on(topic, function (reqMsg, res) {
        listener(reqMsg, res);
      }); // register this request listener to server


      this._serverRequest('addResponseListener', {
        topic: topic
      }, 'json').then(function (resMsg) {
        debug("addResponseListener topic: ".concat(topic, ", result: ").concat(resMsg.payload.result));

        if (resMsg.isError('REGISTER_FAIL')) {
          _this5._requestEvent.removeAllListeners(topic);

          _this5._errorEvent.emit('error', new Error("Register pull listener for topic: ".concat(topic, " fail")));
        }
      });

      return this;
    }
  }, {
    key: "push",
    value: function push(target, topic, items) {
      var _this6 = this;

      var contentType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'json';

      if (arguments.length < 3) {
        return Promise.reject(new Error('Need at least three arguments.'));
      }

      return new Promise(function (resolve, reject) {
        var msg = Message.create('push');
        msg.setTopic(topic);
        msg.setTarget(target);
        msg.setPayload(items, contentType);

        _this6._socket.write(msg.getBuffer(), 'utf8', function () {
          resolve();
        });
      });
    }
  }, {
    key: "pull",
    value: function pull(topicArg, optionsArg, listenerArg) {
      var _this7 = this;

      if (arguments.length < 2) {
        return Promise.reject(new Error('Need at least two arguments.'));
      }

      var topic = topicArg;
      var options = arguments.length === 2 ? {
        prefetch: 1
      } : optionsArg;
      var listener = arguments.length === 2 ? optionsArg : listenerArg;
      var regPayload = {
        topic: topic,
        options: options
      };

      this._pullEvent.on(topic, function (msg) {
        Promise.resolve(listener(msg)).then(function () {
          _this7._sendAck(msg.header.id, topic);
        });
      });

      this._serverRequest('addPullListener', regPayload, 'json').then(function (resMsg) {
        if (resMsg.isError('REGISTER_FAIL')) {
          _this7._pullEvent.removeAllListeners(topic);

          _this7._errorEvent.emit('error', new Error("Register pull listener for topic: ".concat(topic, " fail")));
        }
      });

      return this;
    }
  }, {
    key: "publish",
    value: function publish(target, topic, data) {
      var _this8 = this;

      var contentType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'json';

      if (arguments.length < 3) {
        return Promise.reject(new Error('Need at least three arguments.'));
      }

      return new Promise(function (resolve, reject) {
        var msg = Message.create('pub');
        msg.setTopic(topic);
        msg.setTarget(target);
        msg.setPayload(data, contentType);

        _this8._socket.write(msg.getBuffer(), 'utf8', function () {
          resolve();
        });
      });
    }
  }, {
    key: "subscribe",
    value: function subscribe(topic, listener) {
      var _this9 = this;

      if (arguments.length < 2) {
        return Promise.reject(new Error('Need at least two arguments.'));
      }

      var regPayload = {
        topic: topic
      };

      this._subEvent.on(topic, function (msg) {
        listener(msg);
      });

      return this._serverRequest('addSubscribeListener', regPayload, 'json').then(function (resMsg) {
        if (resMsg.isError('REGISTER_FAIL')) {
          _this9._subEvent.removeAllListeners(topic);

          _this9._errorEvent.emit('error', new Error("Register subscribe listener for topic: ".concat(topic, " fail")));
        }
      });
      return this;
    }
  }, {
    key: "_sendAck",
    value: function _sendAck(id, topic) {
      var msg = Message.create('ack', id);
      msg.setTopic(topic); // debug('Send Ack. header:', msg.header);

      this._socket.write(msg.getBuffer());
    }
  }]);
  return Channel;
}();

var _registerChannel = function _registerChannel(channel) {
  return channel._serverRequest('register').then(function (msg) {
    if (msg.header.error) {
      var err = new Error('register channel fail. errCode:' + msg.header.error);
      throw err;
    } else {
      return channel;
    }
  });
}; // connect(channelName, serverPath, [connectListener])
// connect(channelName, port[, host][, connectListener])

/* eslint-disable-next-line consistent-return */


exports.connect = function () {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (args.length < 2) {
    throw new Error('Invalid create argument, it needs at least two argument.');
  }

  if (args.length < 1 || typeof args[0] !== 'string') {
    throw new TypeError('Invalid client channel name, channel name must be a string type.');
  }

  if (args.length < 2) {
    throw new TypeError('Invalid parameter');
  }

  var channelName = args[0].trim();
  var connectListener = args[args.length - 1];
  var options = {}; // process port or serverPath

  if (_.isString(args[1])) {
    options.path = getSocketPath(args[1]);
  } else if (_.isNumber(args[1])) {
    options.port = args[1];
  }

  if (args.length > 2) {
    if (_.isString(args[2])) {
      options.host = args[2];
    }
  } // use node.js callback pattern


  if (_.isFunction(connectListener)) {
    var socket = net.connect(options);
    var channel = new Channel(channelName, socket);
    socket.on('connect', function () {
      return _registerChannel(channel).then(function () {
        connectListener(null, channel);
      }).catch(function (err) {
        connectListener(err, channel);
      });
    });
  } else {
    // use Promise pattern
    return new Promise(function (resolve, reject) {
      var socket = net.connect(options, function () {
        var channel = new Channel(channelName, socket);
        return _registerChannel(channel).then(resolve).catch(function (err) {
          reject(err);
        });
      });
    });
  }
};

/***/ })
/******/ ]);