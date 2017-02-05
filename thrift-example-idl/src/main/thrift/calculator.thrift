namespace java com.twitter.calculator.thriftjava
#@namespace scala com.twitter.calculator.thriftscala
namespace rb Calculator

struct Num{1: i32 a}
struct UpgradeReply{}

service Calculator {


  /**
   * Increment a number
   */
  Num increment(
    1: Num n
  )

  UpgradeReply x()
}
