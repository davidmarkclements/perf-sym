#!/usr/bin/env node

var args = require('minimist')(process.argv.slice(2))
var pump = require('pump')
/*
  cat stacks.out | perf-sym <pid>

  --relative=[path] -r=[path] [false]
  --keep-addr -k [false]
  --no-v8-internals --no-v8 [true]
  --no-sys-internals --no-sys [false]
  --no-gc-internals --no-gc [false] (--no-v8 must be false to apply)
  --no-unresolved --no-ur [false]
 */

var stream = require('./')(Object.assign(args, {
  pid: args._[0],
  internal: {
    v8: 'v8' in args ? !args.v8 : true,
    sys: 'sys' in args ? !args.sys : false,
    gc: 'gc' in args ? !args.gc : false,
    ur: 'ur' in args ? !args.ur : false
  }
}), {
  alias: {
    v8: ['v8-internals'],
    sys: ['sys-internals'],
    gc: ['no-gc-internals'],
    ur: ['unresolved']
  }
})

pump(process.stdin, stream, process.stdout)