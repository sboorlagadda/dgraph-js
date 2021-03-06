# Simple example project

Simple project demonstrating the use of [dgraph-js], the official javascript client
for Dgraph.

[dgraph-js]:https://github.com/dgraph-io/dgraph-js

## Running

### Start Dgraph server

You will need to install [Dgraph v0.9.4 or above][releases] and run it.

[releases]: https://github.com/dgraph-io/dgraph/releases

You can run the commands below to start a clean Dgraph server everytime, for testing
and exploration.

First, create two separate directories for `dgraph zero` and `dgraph server`.

```sh
mkdir -p dgraphdata/zero dgraphdata/data
```

Then start `dgraph zero`:

```sh
cd dgraphdata/zero
rm -r zw; dgraph zero --port_offset -2000
```

Finally, start the `dgraph server`:

```sh
cd dgraphdata/data
rm -r p w; dgraph server --memory_mb=1024 --zero localhost:5080
```

For more configuration options, and other details, refer to
[docs.dgraph.io](https://docs.dgraph.io)

## Install dependencies

```sh
npm install
```

## Run the sample code

For Node.js >= v7.6, run:

```sh
node index.js
```

For Node.js < v7.6 or if you don't want to use the async/await syntax, run:

```sh
node index-pre-v7.6.js
```

Your output should look something like this:

```console
people found: 1
{ name: 'Alice',
  age: 26,
  married: true,
  loc: { type: 'Point', coordinates: [ 1.1, 2 ] },
  dob: '1980-02-01T17:30:00Z',
  friend: [ { name: 'Charlie', age: 29 }, { name: 'Bob', age: 24 } ],
  school: [ { name: 'Crown Public School' } ] }

DONE!
```

You can explore the source code in the `index.js` and `index-pre-v7.6.js` files.
