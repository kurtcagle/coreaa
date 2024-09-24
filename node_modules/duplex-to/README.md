# duplex-to

`duplex-to` wraps a duplex stream with a `Proxy` and hides the readable or the writable interface.
Hidding part of the interface can be useful in cases where errors are thrown or the code behaves different based on the interface type. 
This package allows to show only one part of a duplex stream for those cases.

## Usage

### readable

The `readable` function wraps a duplex stream to show only the readable interface.
It can be loaded either by path or from the main module by property:

```js
const readable = require('duplex-to/readable')
const { readable } = require('duplex-to')
```

The function is a factory which returns the wrapped stream.
The stream which should be wrapped must be given as argument:

```js
const readableStream = readable(duplexStream)
````

### writable

The `writable` function wraps a duplex stream to show only the writable interface.
It can be loaded either by path or from the main module by property:

```js
const writable = require('duplex-to/writable')
const { writable } = require('duplex-to')
```

The function is a factory which returns the wrapped stream.
The stream which should be wrapped must be given as argument:

```js
const writableStream = writable(duplexStream)
````

## Example

The following examples creates a `PassThrough` duplex stream, which is used to write a text string and allows to access it via the readable stream interface.
The function `noWritablesAccepted` accepts only readable streams and writes the data from the stream to `stdout`.
Passing the `PassThrough` object to the function would throw an error, but with the wrapper only the readable part is visible to the function.

```js
const duplexToReadable = require('duplex-to/readable')
const isStream = require('isstream')
const { PassThrough } = require('readable-stream')

// dummy function which
//   - doesn't accept streams with writable interface
//   - just writes the incoming data to stdout 
function noWritablesAccepted (stream) {
  if (isStream.isWritable(stream)) {
    throw new Error('no writable streams supported')
  }

  stream.on('data', chunk => process.stdout.write(chunk))
}

const stream = new PassThrough()
const readable = duplexToReadable(stream)

// the next line would throw an error if it would be called with stream
noWritablesAccepted(readable)

stream.write('Hello ')
stream.end('World!\n')
```
