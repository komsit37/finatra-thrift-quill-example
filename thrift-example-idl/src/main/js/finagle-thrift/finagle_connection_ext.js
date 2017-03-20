'use strict';
var net = require('net');
// const Connection = require('thrift').Connection
const Connection = require('./finagle_connection').Connection

class FinagleConnection extends Connection{
    constructor(stream, options) {
        super(stream, options)
    }
}

exports.createConnection = function(host, port, options) {
    var stream = net.createConnection(port, host);
    var connection = new FinagleConnection(stream, options);
    connection.host = host;
    connection.port = port;

    return connection;
};