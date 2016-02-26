var fs = require('fs')
var pump = require('pump')
var eos = require('end-of-stream')
var split = require('split2')
var path = require('path')
var resolveJITSymbols = require('resolve-jit-symbols')
var hexRx = /(0x[0-9A-Fa-f]{2,12})/

module.exports = function resolveSymbols(opts) {
  var mapFile = '/tmp/perf-' + opts.pid + '.map'
  var keepAddr = opts.k || opts['keep-addr']
  var relative =  'r' in opts || 'relative' in opts ?
    typeof opts.relative === 'boolean' ? process.cwd() :
      typeof opts.r === 'boolean' ? opts.r :
        opts.relative || opts.r || process.cwd() :
    false

  if (notFound(mapFile, opts)) return

  var map = fs.readFileSync(mapFile, 'utf8')
  var resolver = resolveJITSymbols(map)

  var errors = 0
  var found = 0

  var stream = split(function(line) {
    var match
    var res
    var p

    if (!(match = line.match(hexRx))) {
      errors++

      return line + '\n'
    }
      
    if (res = resolver.resolve(match[1])) {
      found++
      line = line
        .replace(hexRx, (keepAddr ? '$1 ' : '') + res.symbol)

      if (relative) {
        p = line.trim().split(' ').slice(1).join(' ')
        if (p && (p[0] === '/' || p[0] === '.')) {
          line = line.replace(p, path.relative(relative, p))
        }
      }

      return line + '\n'
    }

  })

  stream.on('pipe', function (src) {
    if (!opts.silent) {
      eos(src, function () {
        console.error('symbols found', found)
        console.error('symbols not found', errors)
        console.error('done')
      })
    }

    stream.pipe = (function (pipe) {
      return function (dest) {
        eos(src, function () {
          dest.write('\n\n') //<-- important final line
        })
        return pipe.apply(stream, arguments)
      }

    }(stream.pipe))
  })

  return stream

}

function notFound(file, opts) {
  if (!fs.existsSync(file)|| !fs.statSync(file).size) {
    if (!opts.silent) {
      console.error([
        ,
        'There should be a ' + file + ' file (with a size greater than zero)',
        'It\'s either not there or it\'s empty, make sure you ran your process with',
        '--perf-basic-prof, and make sure to clean up when process receives a SIGINT',
        'see the on-sigint and close-server-on-sigint modules for example',
        ,
      ].join('\n'))
    }
    return true
  }
}