# NodeJS Support for Finagle Thrift

npm install thrift
npm install node-int64

## Finagle Thrift Upgrade Process

### Client Side

Replace standard TBinary protocol with custom TFinagleBinary protocol in `finagle_binary_protocol.js`
1. client call secret upgrade method upon connect to server
```js
this.writeMessageBegin('__can__finagle__trace__v3__', Thrift.MessageType.CALL, 0);
```

2. client receives upgrade reply WITHOUT Tracing header
```js
    if (name === '__can__finagle__trace__v3__') {
        FinagleTBinaryProtocol.upgraded = true
    }
```

3. client adds Tracing Request Header to all subsequent writes
```js
    if (FinagleTBinaryProtocol.upgraded === true || FinagleTBinaryProtocol.upgrading === true) {
        var header = new Tracing.RequestHeader({
            trace_id: 12345, //todo: read tracing header from somewhere
            span_id: 1234567890,
            client_id: new Tracing.ClientId({name: 'nodejs'})
        })
        header.write(this)
    }
```

4. client reads Tracing Response Header from all subsequent reads
```js
  if (FinagleTBinaryProtocol.upgraded === true) {
      var header = new Tracing.ResponseHeader()
      header.read(this)
      this.last_response = header
  }
```

`Tracing.RequestHeader` and `Tracing.ResponseHeader` are structs defined in `tracing.thrift` (from finagle repo)

### Server Side

1. check thrift version in `TBinaryProtocol.readMessageBegin` in `libthrift`
2. check finagle protocol in `ThriftEmulator.ThriftEumulator.ttwitter` in `finagle-thriftmux`
3. reply with `ThriftEmulator.ThriftEumulator.ttwitterAck` (this is basically `UpgradeReply` struct in `tracing.thrift`)
4. prepend `ttwitterHeader` in all subsequent write messages
5. all subsequent messages will be traced using tracing filter in `ThriftMux.server.tracingFilter`, which in turn, calls `ThriftMux.recordRpc`

## TODO

1. How to pass trace request to protocol?
2. How to wait for upgrade reply before sending first message?