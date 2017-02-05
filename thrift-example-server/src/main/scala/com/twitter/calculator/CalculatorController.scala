package com.twitter.calculator

import com.twitter.calculator.thriftscala.{Calculator, Num, UpgradeReply}
import com.twitter.calculator.thriftscala.Calculator._
import com.twitter.finatra.thrift.Controller
import com.twitter.util.Future
import javax.inject.{Inject, Singleton}


@Singleton
class CalculatorController @Inject()()//PersonService is here just to demonstrate how to use service in controller
  extends Controller
  with Calculator.BaseServiceIface {

  override val increment = handle(Increment) { args: Increment.Args =>
    Future.value(Num(args.n.a + 1))
  }

  override val x = handle(X) { args: X.Args =>
    info("x called")
    Future.value(UpgradeReply())
  }
}
