var Tracing = require('./tracing_types')
module.exports = StaticMutableTracingHeader;

function StaticMutableTracingHeader(){}

//FinagleTBinaryProtocol will prepend this tracing request to every outgoing thrift message
StaticMutableTracingHeader.request =  new Tracing.RequestHeader({
    trace_id: null,
    span_id: null,
    client_id: new Tracing.ClientId({name: 'nodejs'}) //default client id
})

//FinagleTBinaryProtocol will set value of this response from TracingHeaderResponse of incoming thrift message
//application can use value from here
StaticMutableTracingHeader.response =  new Tracing.ResponseHeader()

//init header with clientid
StaticMutableTracingHeader.init = function(clientId) {
    StaticMutableTracingHeader.request = new Tracing.RequestHeader({
        trace_id: null,
        span_id: null,
        client_id: new Tracing.ClientId({name: clientId})
    })
};

//set traceid and spanid to be used in the next message
StaticMutableTracingHeader.setTrace = function(traceid, spanid) {
    StaticMutableTracingHeader.request.trace_id = traceid
    StaticMutableTracingHeader.request.span_id = spanid
}