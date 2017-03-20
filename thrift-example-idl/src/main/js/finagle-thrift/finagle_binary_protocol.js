'use strict';

const TBinaryProtocol = require('thrift').TBinaryProtocol;
var Tracing = require('./tracing_types');
var StaticMutableTracingHeader = require('./static_mutable_tracing_header');

class FinagleTBinaryProtocol extends TBinaryProtocol {

    constructor(trans, strictRead, strictWrite) {
        super(trans, strictRead, strictWrite);
    };

    writeMessageBegin(name, type, seqid) {
        StaticMutableTracingHeader.request.write(this); // prepend request from shared object (value should be set by application prior to method call)
        super.writeMessageBegin(name, type, seqid);
    };

    writeMessageBeginWithoutTracing(name, type, seqid) {
        super.writeMessageBegin(name, type, seqid);
    };

    readMessageBegin() {
        StaticMutableTracingHeader.response = new Tracing.ResponseHeader();
        StaticMutableTracingHeader.response.read(this);  //read response into a shared object which application can use
        return super.readMessageBegin();
    };

    readMessageBeginWithoutTracing() {
        return super.readMessageBegin();
    };
}

module.exports = FinagleTBinaryProtocol;