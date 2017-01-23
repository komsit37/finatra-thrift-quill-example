# Finatra-quill project template

## Prerequisite
you'll need flyway command-line https://flywaydb.org/documentation/commandline/
```bash
C:\Users\pkomsit.FOLIO-SEC\dev\scala\folio\finatra-quill-template>flyway -v
Flyway 4.0.3 by Boxfuse
```

## Setup
update db config in
* flyway.conf
* xxx.conf

then run below from command line
```bash
> flyway migrate //to create initial db schema
> sbt compile
```

to run server
```
sbt "thriftExampleServer/run"
```

to run test client
```
sbt "thriftExampleServer/test:runMain com.twitter.calculator.example.CalculatorClientExample"
```

to run unit test
```
> sbt test
```

## Dependencies
* flyway - database versioning and migration
* finatra - framework for thrift server
  * guice - library for dependency injection
* quill - library to generate sql from case class at compile time
* finagle-mysql - asynchronous mysql database connection library (kind of like jdbc, but it's asynchronous)
* scrooge-sbt-plugin - sbt plugin to generate scala code from thrift
