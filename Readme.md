# perf-sym

Translate symbol names generated by `--basic-perf-prof` into JavaScript names

## Install

```sh
[sudo] npm i -g perf-sym
```

## Usage

```
  cat stacks.out | perf-sym <pid>

  --relative=[path] -r=[path] [false]
  --keep-addr -k [false]
  --no-v8-internals --no-v8 [true]
  --no-sys-internals --no-sys [false]
  --no-gc-internals --no-gc [false] (--no-v8 must be false to apply)
  --no-unresolved --no-ur [false]

```


## Generate a flamegraph

### OS X

#### Requirements

```sh
[sudo] npm install -g stackvis
```

```sh
[sudo] npm install -g cpuprofilify
```

```
sudo echo # need me some sudo perms

node --perf-basic-prof index.js &

export PID=$!

(sudo profile_1ms.d -p $PID  > stacks.out; kill -s INT $PID) &

npm test

sudo killall dtrace

cat stacks.out | perf-sym -r initial --no-sys $PID | stackvis perf > flamegraph.html

open flamegraph.html
```

### Linux

#### Requirements

```sh
[sudo] npm install -g stackvis
```


```
node --perf-basic-prof index.js &

export PID=$!

(perf record -p $PID -i -g -e cycles:u; perf script > stacks.out; kill -s INT $PID) &

npm test

killall perf; killall perf

cat stacks.out | perf-sym -r initial --no-sys $PID | stackvis perf > flamegraph.html

open flamegraph.html
```