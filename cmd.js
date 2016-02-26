#!/usr/bin/env node

var args = require('minimist')(process.argv.slice(2))
var pump = require('pump')
/*
  cat stacks.out | perf-sym <pid>

  --relative=[path] -r=[path] [false]
  --keep-addr -k [false]
 */

var stream = require('./')(Object.assign(args, {
  pid: args._[0]
}))

pump(process.stdin, stream, process.stdout)