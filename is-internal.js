var v8internalsRegex = new RegExp(
    'node::Start\\(|node`(?:start\\+)?0x[0-9A-Fa-f]+'                                // node startup
  + '|v8::internal::|v8::Function::Call|v8::Function::NewInstance'                   // v8 internal C++
  + '|Builtin:|Stub:|StoreIC:|LoadIC:|LoadPolymorphicIC:|KeyedLoadIC:'               // v8 generated boilerplate
  + '|<Unknown Address>|_platform_\\w+\\$VARIANT\\$|DYLD-STUB\\$|_os_lock_spin_lock' // unknown and lower level things
  + '|\\(root'
)

var sysinternalsRegex = /^\W+dyld|__libc_start/

var unresolvedsRegex = /^\W*0x[0-9A-Fa-f]+\W*$/ // unresolved hex
var v8gcRegex = /v8::internal::Heap::Scavenge/ 

module.exports = function isInternal(l, opts) {
  opts = opts || {}
  opts.v8 = 'v8' in opts ? opts.v8 : true

  return opts.v8 && v8internalsRegex.test(l) || 
    opts.sys && sysinternalsRegex.test(l) ||
    opts.ur && unresolvedsRegex.test(l) ||
    opts.v8 && opts.gc && v8gcRegex.test(l) ||
    false
}