'use strict';

const Message = require('./Message.js');

class Response {
  constructor(reqMsg, socket) {
    this._reqMsg = reqMsg;
    this.socket = socket;
    this.sent = false;
    this._msg = Message.create('res', reqMsg.header.id);
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
    this.sent = true;
  }

}

module.exports = Response;