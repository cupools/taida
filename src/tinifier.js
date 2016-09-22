import tinify from 'tinify'

import apikey from './extend/apikey'

const tinifier = function(buffer) {
  tinify.key = apikey.get()

  return new Promise(
    (resolve, reject) => tinify
      .fromBuffer(buffer)
      .toBuffer(
        (error, data) => (error ? reject(error) : resolve({
          buffer: data,
          size: data.length,
          origin: {
            buffer,
            size: buffer.length
          },
          level: Number((data.length / buffer.length).toFixed(4))
        }))
      )
  )
}

tinifier.apikey = apikey

export default tinifier
