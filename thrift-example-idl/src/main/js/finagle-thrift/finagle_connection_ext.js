'use strict';
var net = require('net');
var thrift = require('thrift/lib/nodejs/lib/thrift/thrift');
//const Connection = require('./finagle_connection').Connection
const Connection = require('thrift').Connection

var InputBufferUnderrunError = require('thrift/lib/nodejs/lib/thrift/input_buffer_underrun_error');

const CanTraceMethodName = "__can__finagle__trace__v3__"

class FinagleConnection extends Connection {

    constructor(stream, options) {
        console.log('custom extension')
        super(stream, options)
        var self = this

        //replace original 'data' event listener with our custom one which handles upgrade reply and tracing response
        this.connection.removeAllListeners('data')
        this.connection.addListener("data", self.transport.receiver(function (transport_with_data) {
            var message = new self.protocol(transport_with_data);
            try {
                while (true) {
                    if (self.upgraded === true) {
                        var header = message.readMessageBegin();
                    } else {
                        var header = message.readMessageBeginOriginal();
                    }

                    var dummy_seqid = header.rseqid * -1;
                    var client = self.client;
                    //The Multiplexed Protocol stores a hash of seqid to service names
                    //  in seqId2Service. If the SeqId is found in the hash we need to
                    //  lookup the appropriate client for this call.
                    //  The connection.client object is a single client object when not
                    //  multiplexing, when using multiplexing it is a service name keyed
                    //  hash of client objects.
                    //NOTE: The 2 way interdependencies between protocols, transports,
                    //  connections and clients in the Node.js implementation are irregular
                    //  and make the implementation difficult to extend and maintain. We
                    //  should bring this stuff inline with typical thrift I/O stack
                    //  operation soon.
                    //  --ra
                    var service_name = self.seqId2Service[header.rseqid];
                    if (service_name) {
                        client = self.client[service_name];
                        delete self.seqId2Service[header.rseqid];
                    }
                    /*jshint -W083 */
                    client._reqs[dummy_seqid] = function (err, success) {
                        transport_with_data.commitPosition();

                        var callback = client._reqs[header.rseqid];
                        delete client._reqs[header.rseqid];
                        if (callback) {
                            callback(err, success);
                        }
                    };
                    /*jshint +W083 */

                    if (client['recv_' + header.fname]) {
                        client['recv_' + header.fname](message, header.mtype, dummy_seqid);
                    } else {
                        delete client._reqs[dummy_seqid];
                        if (header.fname == CanTraceMethodName) {
                            console.log('upgraded') //do nothing for upgrade
                            self.upgraded = true
                        } else {
                            self.emit("error",
                                new thrift.TApplicationException(thrift.TApplicationExceptionType.WRONG_METHOD_NAME,
                                    "Received a response to an unknown RPC function"));
                        }
                    }
                }
            }
            catch (e) {
                if (e instanceof InputBufferUnderrunError) {
                    transport_with_data.rollbackPosition();
                }
                else {
                    self.emit('error', e);
                }
            }
        }));

        this.upgrade()
    }

    upgrade() {
        var self = this
        console.log('upgrading')
        var writeCb = function (buf, seqid) {
            self.connection.write(buf, seqid);
        };
        var output = new self.protocol(new self.transport(undefined, writeCb));
        output.writeMessageBeginOriginal(CanTraceMethodName, thrift.MessageType.CALL, 0);
        output.writeMessageEnd();
        output.flush();
    }
}

exports.createConnection = function (host, port, options) {
    var stream = net.createConnection(port, host);
    var connection = new FinagleConnection(stream, options);
    connection.host = host;
    connection.port = port;

    return connection;
};