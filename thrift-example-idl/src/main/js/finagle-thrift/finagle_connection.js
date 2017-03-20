'use strict';
var net = require('net');
var thrift = require('thrift/lib/nodejs/lib/thrift/thrift');
//const Connection = require('./finagle_connection').Connection
const Connection = require('thrift').Connection

var InputBufferUnderrunError = require('thrift/lib/nodejs/lib/thrift/input_buffer_underrun_error');

const CanTraceMethodName = "__can__finagle__trace__v3__";

class FinagleConnection extends Connection {

    constructor(stream, options) {
        console.log('Using finagle thrift extension');
        super(stream, options);

        var self = this;
        self.upgraded = false; //initial value for upgraded state

        //replace original 'data' event listener with our custom one which handles upgrade reply and tracing response
        this.connection.removeAllListeners('data')
        this.connection.addListener("data", self.transport.receiver(function (transport_with_data) {
            var message = new self.protocol(transport_with_data);
            try {
                while (true) {
                    if (self.upgraded === false) {
                        var header = message.readMessageBeginWithoutTracing(); //this is a reply for our upgrade request, which doesn't contain tracing header
                    } else {
                        var header = message.readMessageBegin(); //after upgrade success, we can expect tracing header in every request
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
                        if (!self.isUpgradeReply(header.fname)) {
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

        this.upgrade(); //upgrade to finagle thrift
    }

    upgrade() {//upgrade by calling secret pre-defined method name '__can__finagle__trace__v3__' in server and wait for upgrade reply
        let self = this;
        console.log('Upgrading to finagle thrift');
        let writeCb = function (buf, seqid) {
            self.connection.write(buf, seqid);
        };
        let output = new self.protocol(new self.transport(undefined, writeCb));
        output.writeMessageBeginWithoutTracing(CanTraceMethodName, thrift.MessageType.CALL, 0);
        output.writeMessageEnd();
        output.flush();
    }

    isUpgradeReply(fname) {
        let self = this;
        if (fname == CanTraceMethodName) { //we won't find upgrade method handler in service object, so need to suppress error here
            console.log('Upgraded to finagle thrift');
            self.upgraded = true; //got reply, which means upgrade success
            return true
        } else {
            return false
        }
    }
}

exports.createConnection = function (host, port, options) {
    let stream = net.createConnection(port, host);
    let connection = new FinagleConnection(stream, options);
    connection.host = host;
    connection.port = port;

    return connection;
};