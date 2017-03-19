var thrift = require('thrift');
var Calculator = require('./gen-nodejs/Calculator');
// var Finagle = require('./gen-nodejs/Finagle');
var ttypes = require('./gen-nodejs/calculator_types');

var transport = thrift.TFramedTransport;
// var protocol = thrift.TBinaryProtocol;
var protocol = require('./finagle-thrift/finagle_binary_protocol');

var connection = thrift.createConnection("localhost", 9911, {
  transport : transport,
  protocol : protocol
});

connection.on('error', function(err) {
  console.error(err);
});

// Create a Calculator client with the connection
var client = thrift.createClient(Calculator, connection);
// var client = thrift.createClient(Finagle, connection);

// client.upgrade(function(err, res){
//     console.log('up')
    var num = new ttypes.Num({a: 1})
    //client.x(function(err, response) {
        client.increment(num, function(err, r) {
            console.log("1+1=" + r.a);
            client.increment(num, function(err, r) {
                console.log("1+1=" + r.a);
                connection.end();
            });
        });
    //});
// })
// protocol.upgraded = true

// client.__can__finagle__trace__v3__(function(err, response) {
//     console.log("upgrade=" + response);
// });


