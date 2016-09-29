import tinify from 'tinify'

import apikey from './apikey'

const tinifier = function () {
  setKey()

  return function (buffer) {
    return compress(buffer).catch(ret => handleError(compress, ret))
  }
}

function setKey() {
  tinify.key = apikey.get()
}

function compress(buffer) {
  let _key = tinify._key
  return new Promise(
    (resolve, reject) => (
      tinify
        .fromBuffer(buffer)
        .toBuffer(
          (error, data) => {
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
        )
    )
  )
}

function handleError(task, ret) {
  let {_key, ...payload} = ret

  // error is not for apikey validation
  if (!_key) {
    return Promise.reject(error)
  }

  let {error, buffer} = payload
  let {message} = error

  if (message.includes(401)) {
    // Credentials are invalid (HTTP 401/Unauthorized)
    // should change another apikey and fallback to compress
    apikey.depress(_key)
    return task(buffer)
  }

  return Promise.reject(error)
}

tinifier.tinify = tinify
tinifier.apikey = apikey

export default tinifier()
