var thrift = require('thrift');
var Calculator = require('./gen-nodejs/Calculator');
var ttypes = require('./gen-nodejs/calculator_types');

var transport = thrift.TFramedTransport;
var protocol = thrift.TBinaryProtocol;

var connection = thrift.createConnection("localhost", 9911, {
  transport : transport,
  protocol : protocol
});

connection.on('error', function(err) {
  assert(false, err);
});

// Create a Calculator client with the connection
var client = thrift.createClient(Calculator, connection);


client.increment(new ttypes.Num(1), function(err, response) {
  console.log("1+1=" + response.a);
  connection.end();
});
