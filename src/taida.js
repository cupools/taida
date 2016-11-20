import tinify from 'tinify'

const taida = function (key, buffer, fallback) {
  return compress(key, buffer)
    .then(handleResult(buffer))
    .catch(handleError(buffer, fallback))
}

function compress(key, buffer) {
  return !key
    ? Promise.reject(new Error('failed for no usable apikey'))
    : new Promise((resolve, reject) => {
      tinify.key = key
      tinify
        .fromBuffer(buffer)
        .toBuffer((error, data) => (error ? reject(error) : resolve(data)))
    }
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

function handleError(buffer, fallback) {
  return error => {
    const { message } = error

    if (String.includes(message, 401) && fallback) {
      // Credentials are invalid (HTTP 401/Unauthorized)
      // should change another apikey and fallback to compress
      return fallback()
    }

    return Promise.reject(error)
  }
}

export default taida
