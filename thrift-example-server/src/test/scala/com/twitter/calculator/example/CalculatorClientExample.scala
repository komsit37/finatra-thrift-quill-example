package com.twitter.calculator.example

import com.twitter.calculator.thriftscala.Calculator
import com.twitter.finagle.ThriftMux
import com.twitter.finagle.thrift.ClientId
import com.twitter.util.{Await, Future}

object CalculatorClientExample extends App {
  val client = ThriftMux.Client()
    .withClientId(ClientId("client123"))
    .newIface[Calculator[Future]]("localhost:9911", "calculator-server")
  val res = Await.result(client.addNumbers(1, 2))
  println(res)
}
