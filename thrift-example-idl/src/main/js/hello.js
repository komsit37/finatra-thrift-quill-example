'use strict';
var thrift = require('thrift');
var Calculator = require('./gen-nodejs/Calculator');
// var Finagle = require('./gen-nodejs/Finagle');
var ttypes = require('./gen-nodejs/calculator_types');

var transport = thrift.TFramedTransport;
// var protocol = thrift.TBinaryProtocol;
var protocol = require('./finagle-thrift/finagle_binary_protocol');
// var finagleConnection = require('./finagle-thrift/finagle_connection');
var finagleConnection = require('./finagle-thrift/finagle_connection_ext');
var TracingHeader = require('./finagle-thrift/tracing_header_factory');

var connection = finagleConnection.createConnection("localhost", 9911, {
  transport : transport,
  protocol : protocol
});

connection.on('error', function(err) {
  console.error(err);
});

// Create a Calculator client with the connection
var client = thrift.createClient(Calculator, connection);

TracingHeader.init('hello') //init header with clientId 'hello'
TracingHeader.setTrace(1, 2) //set trace id = 1, span id = 2
    var num = new ttypes.Num({a: 1})
    //client.x(function(err, response) {
        client.increment(num, function(err, r) {
            console.log("1+1=" + r.a);
            TracingHeader.setTrace(2, 3)
            client.increment(num, function(err, r) {
                console.log("1+1=" + r.a);
                connection.end();
            });
        });

