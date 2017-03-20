'use strict';

const TBinaryProtocol = require('thrift').TBinaryProtocol
var Tracing = require('./tracing_types');
var TracingHeader = require('./tracing_header_factory');

class FinagleTBinaryProtocol extends TBinaryProtocol {

    constructor(trans, strictRead, strictWrite) {
        super(trans, strictRead, strictWrite)
    };

    writeMessageBegin(name, type, seqid) {
        TracingHeader.header.write(this)
        super.writeMessageBegin(name, type, seqid)
    };

    writeMessageBeginOriginal(name, type, seqid) {
        super.writeMessageBegin(name, type, seqid)
    };

    readMessageBegin() {
        var header = new Tracing.ResponseHeader()
        header.read(this)
        //todo: do something tracing response
        return super.readMessageBegin()
    };

    readMessageBeginOriginal() {
        return super.readMessageBegin()
    };
}

module.exports = FinagleTBinaryProtocol