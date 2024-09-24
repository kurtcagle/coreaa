const assert = require('assert')
const getStream = require('get-stream')
const isStream = require('isstream')
const { describe, it } = require('mocha')
const duplexToReadable = require('../readable')
const { PassThrough } = require('readable-stream')

describe('readable', () => {
  it('should be a function', () => {
    assert.strictEqual(typeof duplexToReadable, 'function')
  })

  it('should return a stream', () => {
    const result = duplexToReadable(new PassThrough())

    assert(isStream(result))
  })

  it('should wrap only the readable interface', () => {
    const result = duplexToReadable(new PassThrough())

    assert(isStream.isReadable(result))
    assert(result.readable) // used by stream.finished
    assert(!isStream.isWritable(result))
    assert(!result.writable) // used by stream.finished
  })

  it('should keep object mode information', () => {
    const result = duplexToReadable(new PassThrough({ objectMode: true }))

    assert(result._readableState.objectMode)
  })

  it('should forward the content', async () => {
    const input = new PassThrough()
    const output = duplexToReadable(input)

    input.write('a')
    input.write('b')
    input.end('c')

    const result = await getStream(output)

    assert.strictEqual(result, 'abc')
  })
})
