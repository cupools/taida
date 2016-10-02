import tinify from 'tinify'
import R from 'ramda'

import apikey from './apikey'

const tinifier = function (buffer) {
  return compress(buffer).catch(R.curry(handleError)(compress))
}

function compress(buffer) {
  let _key = tinify.key = apikey.get()

  if (!_key) {
    return Promise.reject(new Error('failed for no usable apikey'))
  }

  return new Promise(
    (resolve, reject) => (
      tinify
        .fromBuffer(buffer)
        .toBuffer(R.curry(handleResult)(resolve, reject, buffer, _key))
    )
  )
}

function handleResult(resolve, reject, buffer, _key, error, data) {
  if (error) {
    reject({
      error,
      buffer,
      _key
    })
  } else {
    resolve({
      buffer: data,
      size: data.length,
      origin: {
        buffer,
        size: buffer.length
      },
      level: Number((data.length / buffer.length).toFixed(4))
    })
  }
}

function handleError(fallback, ret) {
  // unexpect error
  if (ret instanceof Error) {
    return Promise.reject(ret)
  }

  let {_key, error, buffer} = ret
  let {message} = error

  if (message.includes(401)) {
    // Credentials are invalid (HTTP 401/Unauthorized)
    // should change another apikey and fallback to compress
    apikey.depress(_key)
    return fallback(buffer)
  }

  return Promise.reject(error)
}

tinifier.tinify = tinify
tinifier.apikey = apikey

export default tinifier
