/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

//mainly taken from binary_protocol adding parts to handle finagle upgrade and tracing header

var log = require('thrift/lib/nodejs/lib/thrift/log');
var binary = require('thrift/lib/nodejs/lib/thrift/binary');
var Thrift = require('thrift/lib/nodejs/lib/thrift/thrift');

var Int64 = require('node-int64');
var Type = Thrift.Type;

var Tracing = require('./tracing_types')

module.exports = FinagleTBinaryProtocol;

// JavaScript supports only numeric doubles, therefore even hex values are always signed.
// The largest integer value which can be represented in JavaScript is +/-2^53.
// Bitwise operations convert numbers to 32 bit integers but perform sign extension
// upon assigning values back to variables.
var VERSION_MASK = -65536,   // 0xffff0000
    VERSION_1 = -2147418112, // 0x80010000
    TYPE_MASK = 0x000000ff;

// FinagleTBinaryProtocol.upgraded = false
function FinagleTBinaryProtocol(trans, strictRead, strictWrite) {
  this.trans = trans;
  this.strictRead = (strictRead !== undefined ? strictRead : false);
  this.strictWrite = (strictWrite !== undefined ? strictWrite : true);

  if (FinagleTBinaryProtocol.upgraded === undefined) {
      this.upgrade()
  }
};

FinagleTBinaryProtocol.prototype.upgrade = function() {
  console.log('init')
  this.writeMessageBegin('__can__finagle__trace__v3__', Thrift.MessageType.CALL, 0);
  // var args = new Calculator___can__finagle__trace__v3___args();
  // args.write(output);
  this.writeMessageEnd();
  FinagleTBinaryProtocol.upgraded = false // do not upgrade until we get reply
  FinagleTBinaryProtocol.upgrading = true //
  this.flush();
}

FinagleTBinaryProtocol.prototype.flush = function() {
  return this.trans.flush();
};

FinagleTBinaryProtocol.prototype.writeMessageBegin = function(name, type, seqid) {
  //komsit custom
    //todo: we are assuming upgrade always success by adding tracing header before upgrade success (upgrading === true)
    //in other words, this will not work with non-finagle thrift
    if (FinagleTBinaryProtocol.upgraded === true || FinagleTBinaryProtocol.upgrading === true) {
        var header = new Tracing.RequestHeader({
            trace_id: 12345, //todo: read tracing header from somewhere
            span_id: 1234567890,
            client_id: new Tracing.ClientId({name: 'nodejs'})
        })
        header.write(this)
    }
    if (this.strictWrite) {
      this.writeI32(VERSION_1 | type);
      this.writeString(name);
      this.writeI32(seqid);
    } else {
      this.writeString(name);
      this.writeByte(type);
      this.writeI32(seqid);
    }
    // Record client seqid to find callback again
    if (this._seqid) {
      // TODO better logging log warning
      log.warning('SeqId already set', { 'name': name });
    } else {
      this._seqid = seqid;
      this.trans.setCurrSeqId(seqid);
    }
};

FinagleTBinaryProtocol.prototype.writeMessageEnd = function() {
    if (this._seqid) {
        this._seqid = null;
    } else {
        log.warning('No seqid to unset');
    }
};

FinagleTBinaryProtocol.prototype.writeStructBegin = function(name) {
};

FinagleTBinaryProtocol.prototype.writeStructEnd = function() {
};

FinagleTBinaryProtocol.prototype.writeFieldBegin = function(name, type, id) {
  this.writeByte(type);
  this.writeI16(id);
};

FinagleTBinaryProtocol.prototype.writeFieldEnd = function() {
};

FinagleTBinaryProtocol.prototype.writeFieldStop = function() {
  this.writeByte(Type.STOP);
};

FinagleTBinaryProtocol.prototype.writeMapBegin = function(ktype, vtype, size) {
  this.writeByte(ktype);
  this.writeByte(vtype);
  this.writeI32(size);
};

FinagleTBinaryProtocol.prototype.writeMapEnd = function() {
};

FinagleTBinaryProtocol.prototype.writeListBegin = function(etype, size) {
  this.writeByte(etype);
  this.writeI32(size);
};

FinagleTBinaryProtocol.prototype.writeListEnd = function() {
};

FinagleTBinaryProtocol.prototype.writeSetBegin = function(etype, size) {
  this.writeByte(etype);
  this.writeI32(size);
};

FinagleTBinaryProtocol.prototype.writeSetEnd = function() {
};

FinagleTBinaryProtocol.prototype.writeBool = function(bool) {
  if (bool) {
    this.writeByte(1);
  } else {
    this.writeByte(0);
  }
};

FinagleTBinaryProtocol.prototype.writeByte = function(b) {
  this.trans.write(new Buffer([b]));
};

FinagleTBinaryProtocol.prototype.writeI16 = function(i16) {
  this.trans.write(binary.writeI16(new Buffer(2), i16));
};

FinagleTBinaryProtocol.prototype.writeI32 = function(i32) {
  this.trans.write(binary.writeI32(new Buffer(4), i32));
};

FinagleTBinaryProtocol.prototype.writeI64 = function(i64) {
  if (i64.buffer) {
    this.trans.write(i64.buffer);
  } else {
    this.trans.write(new Int64(i64).buffer);
  }
};

FinagleTBinaryProtocol.prototype.writeDouble = function(dub) {
  this.trans.write(binary.writeDouble(new Buffer(8), dub));
};

FinagleTBinaryProtocol.prototype.writeString = function(arg) {
  if (typeof(arg) === 'string') {
    this.writeI32(Buffer.byteLength(arg, 'utf8'));
    this.trans.write(arg, 'utf8');
  } else if (arg instanceof Buffer) {
    this.writeI32(arg.length);
    this.trans.write(arg);
  } else {
    throw new Error('writeString called without a string/Buffer argument: ' + arg);
  }
};

FinagleTBinaryProtocol.prototype.writeBinary = function(arg) {
  if (typeof(arg) === 'string') {
    this.writeI32(Buffer.byteLength(arg, 'utf8'));
    this.trans.write(arg, 'utf8');
  } else if ((arg instanceof Buffer) ||
             (Object.prototype.toString.call(arg) == '[object Uint8Array]')) {
    // Buffers in Node.js under Browserify may extend UInt8Array instead of
    // defining a new object. We detect them here so we can write them
    // correctly
    this.writeI32(arg.length);
    this.trans.write(arg);
  } else {
    throw new Error('writeBinary called without a string/Buffer argument: ' + arg);
  }
};

FinagleTBinaryProtocol.prototype.readMessageBegin = function() {
//komsit custom
  if (FinagleTBinaryProtocol.upgraded === true) {
      var header = new Tracing.ResponseHeader()
      header.read(this)
      this.last_response = header
  }

  var sz = this.readI32();
  var type, name, seqid;



  if (sz < 0) {
    var version = sz & VERSION_MASK;
    if (version != VERSION_1) {
      console.log("BAD: " + version);
      throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.BAD_VERSION, "Bad version in readMessageBegin: " + sz);
    }
    type = sz & TYPE_MASK;
    name = this.readString();
    seqid = this.readI32();
  } else {
    if (this.strictRead) {
      throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.BAD_VERSION, "No protocol version header");
    }
    name = this.trans.read(sz);
    type = this.readByte();
    seqid = this.readI32();
  }
    if (name === '__can__finagle__trace__v3__') {
        FinagleTBinaryProtocol.upgraded = true
    }
  return {fname: name, mtype: type, rseqid: seqid};
};

FinagleTBinaryProtocol.prototype.readMessageEnd = function() {
};

FinagleTBinaryProtocol.prototype.readStructBegin = function() {
  return {fname: ''};
};

FinagleTBinaryProtocol.prototype.readStructEnd = function() {
};

FinagleTBinaryProtocol.prototype.readFieldBegin = function() {
  var type = this.readByte();
  if (type == Type.STOP) {
    return {fname: null, ftype: type, fid: 0};
  }
  var id = this.readI16();
  return {fname: null, ftype: type, fid: id};
};

FinagleTBinaryProtocol.prototype.readFieldEnd = function() {
};

FinagleTBinaryProtocol.prototype.readMapBegin = function() {
  var ktype = this.readByte();
  var vtype = this.readByte();
  var size = this.readI32();
  return {ktype: ktype, vtype: vtype, size: size};
};

FinagleTBinaryProtocol.prototype.readMapEnd = function() {
};

FinagleTBinaryProtocol.prototype.readListBegin = function() {
  var etype = this.readByte();
  var size = this.readI32();
  return {etype: etype, size: size};
};

FinagleTBinaryProtocol.prototype.readListEnd = function() {
};

FinagleTBinaryProtocol.prototype.readSetBegin = function() {
  var etype = this.readByte();
  var size = this.readI32();
  return {etype: etype, size: size};
};

FinagleTBinaryProtocol.prototype.readSetEnd = function() {
};

FinagleTBinaryProtocol.prototype.readBool = function() {
  var b = this.readByte();
  if (b === 0) {
    return false;
  }
  return true;
};

FinagleTBinaryProtocol.prototype.readByte = function() {
  return this.trans.readByte();
};

FinagleTBinaryProtocol.prototype.readI16 = function() {
  return this.trans.readI16();
};

FinagleTBinaryProtocol.prototype.readI32 = function() {
  return this.trans.readI32();
};

FinagleTBinaryProtocol.prototype.readI64 = function() {
  var buff = this.trans.read(8);
  return new Int64(buff);
};

FinagleTBinaryProtocol.prototype.readDouble = function() {
  return this.trans.readDouble();
};

FinagleTBinaryProtocol.prototype.readBinary = function() {
  var len = this.readI32();
  return this.trans.read(len);
};

FinagleTBinaryProtocol.prototype.readString = function() {
  var len = this.readI32();
  return this.trans.readString(len);
};

FinagleTBinaryProtocol.prototype.getTransport = function() {
  return this.trans;
};

FinagleTBinaryProtocol.prototype.skip = function(type) {
  switch (type) {
    case Type.STOP:
      return;
    case Type.BOOL:
      this.readBool();
      break;
    case Type.BYTE:
      this.readByte();
      break;
    case Type.I16:
      this.readI16();
      break;
    case Type.I32:
      this.readI32();
      break;
    case Type.I64:
      this.readI64();
      break;
    case Type.DOUBLE:
      this.readDouble();
      break;
    case Type.STRING:
      this.readString();
      break;
    case Type.STRUCT:
      this.readStructBegin();
      while (true) {
        var r = this.readFieldBegin();
        if (r.ftype === Type.STOP) {
          break;
        }
        this.skip(r.ftype);
        this.readFieldEnd();
      }
      this.readStructEnd();
      break;
    case Type.MAP:
      var mapBegin = this.readMapBegin();
      for (var i = 0; i < mapBegin.size; ++i) {
        this.skip(mapBegin.ktype);
        this.skip(mapBegin.vtype);
      }
      this.readMapEnd();
      break;
    case Type.SET:
      var setBegin = this.readSetBegin();
      for (var i2 = 0; i2 < setBegin.size; ++i2) {
        this.skip(setBegin.etype);
      }
      this.readSetEnd();
      break;
    case Type.LIST:
      var listBegin = this.readListBegin();
      for (var i3 = 0; i3 < listBegin.size; ++i3) {
        this.skip(listBegin.etype);
      }
      this.readListEnd();
      break;
    default:
      throw new  Error("Invalid type: " + type);
  }
};
