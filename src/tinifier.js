import tinify from 'tinify'

import apikey from './apikey'

const tinifier = function () {
  setKey()

  return function (buffer) {
    return compress(buffer).catch(error => handleError(compress, error))
  }
}

function setKey() {
  tinify.key = apikey.get()
}

function handleError(task, ret) {
  let {error, buffer} = ret
  let {message} = error

  if (message.includes(401)) {
    // Credentials are invalid (HTTP 401/Unauthorized)
    // should change another apikey and fallback to compress

    return task(buffer)
  }

  return Promise.reject(error)
}

function compress(buffer) {
  return new Promise(
    (resolve, reject) => tinify
      .fromBuffer(buffer)
      .toBuffer(
        (error, data) => {
          if (error) {
            reject({
              error,
              buffer
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
}

tinifier.tinify = tinify
tinifier.apikey = apikey

export default tinifier()
