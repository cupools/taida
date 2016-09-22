import glob from 'glob'
import fs from 'fs-extra'

import tinifier from './tinifier'

export default function (options) {
  let {pattern, dest} = options

  let resources = pattern
    .map(f => glob.sync(f))
    .reduce((ret, arr) => ret.concat(arr), [])

  let handleError = console.log.bind(console)

  let resourcesP = resources
    .map(f => ({
      path: f,
      buffer: fs.readFileSync(f)
    }))
    .map(img => tinifier(img.buffer)
      .then(buffer => Promise.resolve({
        ...img,
        buffer
      }))
    )
    .catch(handleError)

  return Promise
    .all(resourcesP)
    .then(
      datas => datas.map(img => new Promise(
        (resolve, reject) => {
          fs.outputFileSync(
            img.path,
            img.buffer,
            err => (err ? reject(err) : resolve(img))
          )
        }
      ))
    )
    .catch(handleError)
}
