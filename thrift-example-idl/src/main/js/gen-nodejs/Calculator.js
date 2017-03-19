//
// Autogenerated by Thrift Compiler (0.9.3)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//
var thrift = require('thrift');
var Thrift = thrift.Thrift;
var Q = thrift.Q;


var ttypes = require('./calculator_types');
//HELPER FUNCTIONS AND STRUCTURES

Calculator_increment_args = function(args) {
  this.n = null;
  if (args) {
    if (args.n !== undefined && args.n !== null) {
      this.n = new ttypes.Num(args.n);
    }
  }
};
Calculator_increment_args.prototype = {};
Calculator_increment_args.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.STRUCT) {
        this.n = new ttypes.Num();
        this.n.read(input);
      } else {
        input.skip(ftype);
      }
      break;
      case 0:
        input.skip(ftype);
        break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

Calculator_increment_args.prototype.write = function(output) {
  output.writeStructBegin('Calculator_increment_args');
  if (this.n !== null && this.n !== undefined) {
    output.writeFieldBegin('n', Thrift.Type.STRUCT, 1);
    this.n.write(output);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

Calculator_increment_result = function(args) {
  this.success = null;
  if (args) {
    if (args.success !== undefined && args.success !== null) {
      this.success = new ttypes.Num(args.success);
    }
  }
};
Calculator_increment_result.prototype = {};
Calculator_increment_result.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 0:
      if (ftype == Thrift.Type.STRUCT) {
        this.success = new ttypes.Num();
        this.success.read(input);
      } else {
        input.skip(ftype);
      }
      break;
      case 0:
        input.skip(ftype);
        break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

Calculator_increment_result.prototype.write = function(output) {
  output.writeStructBegin('Calculator_increment_result');
  if (this.success !== null && this.success !== undefined) {
    output.writeFieldBegin('success', Thrift.Type.STRUCT, 0);
    this.success.write(output);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

Calculator_x_args = function(args) {
};
Calculator_x_args.prototype = {};
Calculator_x_args.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    input.skip(ftype);
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

Calculator_x_args.prototype.write = function(output) {
  output.writeStructBegin('Calculator_x_args');
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

Calculator_x_result = function(args) {
  this.success = null;
  if (args) {
    if (args.success !== undefined && args.success !== null) {
      this.success = new ttypes.UpgradeReply(args.success);
    }
  }
};
Calculator_x_result.prototype = {};
Calculator_x_result.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 0:
      if (ftype == Thrift.Type.STRUCT) {
        this.success = new ttypes.UpgradeReply();
        this.success.read(input);
      } else {
        input.skip(ftype);
      }
      break;
      case 0:
        input.skip(ftype);
        break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

Calculator_x_result.prototype.write = function(output) {
  output.writeStructBegin('Calculator_x_result');
  if (this.success !== null && this.success !== undefined) {
    output.writeFieldBegin('success', Thrift.Type.STRUCT, 0);
    this.success.write(output);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

CalculatorClient = exports.Client = function(output, pClass) {
    this.output = output;
    this.pClass = pClass;
    this._seqid = 0;
    this._reqs = {};
};
CalculatorClient.prototype = {};
CalculatorClient.prototype.seqid = function() { return this._seqid; }
CalculatorClient.prototype.new_seqid = function() { return this._seqid += 1; }
CalculatorClient.prototype.increment = function(n, callback) {
  this._seqid = this.new_seqid();
  if (callback === undefined) {
    var _defer = Q.defer();
    this._reqs[this.seqid()] = function(error, result) {
      if (error) {
        _defer.reject(error);
      } else {
        _defer.resolve(result);
      }
    };
    this.send_increment(n);
    return _defer.promise;
  } else {
    this._reqs[this.seqid()] = callback;
    this.send_increment(n);
  }
};

CalculatorClient.prototype.send_increment = function(n) {
  var output = new this.pClass(this.output);
  output.writeMessageBegin('increment', Thrift.MessageType.CALL, this.seqid());
  var args = new Calculator_increment_args();
  args.n = n;
  args.write(output);
  output.writeMessageEnd();
  return this.output.flush();
};

CalculatorClient.prototype.recv_increment = function(input,mtype,rseqid) {
  var callback = this._reqs[rseqid] || function() {};
  delete this._reqs[rseqid];
  if (mtype == Thrift.MessageType.EXCEPTION) {
    var x = new Thrift.TApplicationException();
    x.read(input);
    input.readMessageEnd();
    return callback(x);
  }
  var result = new Calculator_increment_result();
  result.read(input);
  input.readMessageEnd();

  if (null !== result.success) {
    return callback(null, result.success);
  }
  return callback('increment failed: unknown result');
};
CalculatorClient.prototype.x = function(callback) {
  this._seqid = this.new_seqid();
  if (callback === undefined) {
    var _defer = Q.defer();
    this._reqs[this.seqid()] = function(error, result) {
      if (error) {
        _defer.reject(error);
      } else {
        _defer.resolve(result);
      }
    };
    this.send_x();
    return _defer.promise;
  } else {
    this._reqs[this.seqid()] = callback;
    this.send_x();
  }
};

CalculatorClient.prototype.send_x = function() {
  var output = new this.pClass(this.output);
  output.writeMessageBegin('x', Thrift.MessageType.CALL, this.seqid());
  var args = new Calculator_x_args();
  args.write(output);
  output.writeMessageEnd();
  return this.output.flush();
};

CalculatorClient.prototype.recv_x = function(input,mtype,rseqid) {
  var callback = this._reqs[rseqid] || function() {};
  delete this._reqs[rseqid];
  if (mtype == Thrift.MessageType.EXCEPTION) {
    var x = new Thrift.TApplicationException();
    x.read(input);
    input.readMessageEnd();
    return callback(x);
  }
  var result = new Calculator_x_result();
  result.read(input);
  input.readMessageEnd();

  if (null !== result.success) {
    return callback(null, result.success);
  }
  return callback('x failed: unknown result');
};

//komsit custom - need this or we get TApplicationException message: 'Received a response to an unknown RPC function'
CalculatorClient.prototype.recv___can__finagle__trace__v3__ = function(input,mtype,rseqid) {
    console.log('upgraded')
};

CalculatorProcessor = exports.Processor = function(handler) {
  this._handler = handler
}
CalculatorProcessor.prototype.process = function(input, output) {
  var r = input.readMessageBegin();
  if (this['process_' + r.fname]) {
    return this['process_' + r.fname].call(this, r.rseqid, input, output);
  } else {
    input.skip(Thrift.Type.STRUCT);
    input.readMessageEnd();
    var x = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN_METHOD, 'Unknown function ' + r.fname);
    output.writeMessageBegin(r.fname, Thrift.MessageType.EXCEPTION, r.rseqid);
    x.write(output);
    output.writeMessageEnd();
    output.flush();
  }
}

CalculatorProcessor.prototype.process_increment = function(seqid, input, output) {
  var args = new Calculator_increment_args();
  args.read(input);
  input.readMessageEnd();
  if (this._handler.increment.length === 1) {
    Q.fcall(this._handler.increment, args.n)
      .then(function(result) {
        var result = new Calculator_increment_result({success: result});
        output.writeMessageBegin("increment", Thrift.MessageType.REPLY, seqid);
        result.write(output);
        output.writeMessageEnd();
        output.flush();
      }, function (err) {
        var result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message);
        output.writeMessageBegin("increment", Thrift.MessageType.EXCEPTION, seqid);
        result.write(output);
        output.writeMessageEnd();
        output.flush();
      });
  } else {
    this._handler.increment(args.n, function (err, result) {
      if (err == null) {
        var result = new Calculator_increment_result((err != null ? err : {success: result}));
        output.writeMessageBegin("increment", Thrift.MessageType.REPLY, seqid);
      } else {
        var result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message);
        output.writeMessageBegin("increment", Thrift.MessageType.EXCEPTION, seqid);
      }
      result.write(output);
      output.writeMessageEnd();
      output.flush();
    });
  }
}

CalculatorProcessor.prototype.process_x = function(seqid, input, output) {
  var args = new Calculator_x_args();
  args.read(input);
  input.readMessageEnd();
  if (this._handler.x.length === 0) {
    Q.fcall(this._handler.x)
      .then(function(result) {
        var result = new Calculator_x_result({success: result});
        output.writeMessageBegin("x", Thrift.MessageType.REPLY, seqid);
        result.write(output);
        output.writeMessageEnd();
        output.flush();
      }, function (err) {
        var result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message);
        output.writeMessageBegin("x", Thrift.MessageType.EXCEPTION, seqid);
        result.write(output);
        output.writeMessageEnd();
        output.flush();
      });
  } else {
    this._handler.x(function (err, result) {
      if (err == null) {
        var result = new Calculator_x_result((err != null ? err : {success: result}));
        output.writeMessageBegin("x", Thrift.MessageType.REPLY, seqid);
      } else {
        var result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message);
        output.writeMessageBegin("x", Thrift.MessageType.EXCEPTION, seqid);
      }
      result.write(output);
      output.writeMessageEnd();
      output.flush();
    });
  }
}

