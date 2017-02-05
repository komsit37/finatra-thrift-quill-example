package com.twitter.calculator.example

import com.twitter.calculator.thriftscala.{Calculator, Num}
import com.twitter.finagle.{Thrift, ThriftMux}
import com.twitter.finagle.thrift.ClientId
import com.twitter.util.{Await, Future}

object CalculatorClientExample extends App {
  val remoteServer = "localhost:9911"
  val client = Thrift.Client()
    .withClientId(ClientId("client123"))
    .newIface[Calculator[Future]](remoteServer, "calculator-server")
  println("Calling addNumbers on remote thrift server: " + remoteServer + "...")
  val res = Await.result(client.increment(Num(1)))
  println("Result is " + res)
}
