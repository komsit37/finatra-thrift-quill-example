var Tracing = require('./tracing_types')
module.exports = TracingHeaderFactory;

function TracingHeaderFactory(){}

//this will be added to every thrift message sent
TracingHeaderFactory.header =  new Tracing.RequestHeader({
    trace_id: null,
    span_id: null,
    client_id: new Tracing.ClientId({name: 'nodejs'})
})

TracingHeaderFactory.init = function(clientId) {
    TracingHeaderFactory.header = new Tracing.RequestHeader({
        trace_id: null,
        span_id: null,
        client_id: new Tracing.ClientId({name: clientId})
    })
};

TracingHeaderFactory.setTrace = function(traceid, spanid) {
    TracingHeaderFactory.header.trace_id = traceid
    TracingHeaderFactory.header.span_id = spanid
}