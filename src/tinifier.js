import tinify from 'tinify'

import apikey from './extend/apikey'

const tinifier = function (buffer) {
  tinify.key = apikey.get()

  return new Promise((resolve, reject) => {
    return tinify.fromBuffer(buffer).toBuffer((error, data) => {
      if (error) {
        return reject(error)
      }
      return resolve(data)
    })
  })
}

tinifier.apikey = apikey

export default tinifier
