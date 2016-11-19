import tinify from 'tinify'

import apikey from './apikey'

const taida = function (buffer) {
  let _key = tinify.key = apikey.get()
  let fallback = taida

  return compress(_key, buffer)
    .then(handleResult(buffer))
    .catch(handleError(_key, buffer, fallback))
}

function compress(_key, buffer) {
  return !_key
    ? Promise.reject(new Error('failed for no usable apikey'))
    : new Promise((resolve, reject) => (
      tinify
        .fromBuffer(buffer)
        .toBuffer((error, data) => (error ? reject(error) : resolve(data)))
    )
  )
}

function handleResult(buffer) {
  return data => Promise.resolve({
    buffer: data,
    size: data.length,
    origin: {
      buffer,
      size: buffer.length
    },
    level: Number((data.length / buffer.length).toFixed(4))
  })
}

function handleError(_key, buffer, fallback) {
  return error => {
    let { message } = error

    if (String.includes(message, 401)) {
      // Credentials are invalid (HTTP 401/Unauthorized)
      // should change another apikey and fallback to compress
      apikey.depress(_key)
      return fallback(buffer)
    }

    return Promise.reject(error)
  }
}

export default taida
