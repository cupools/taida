import glob from 'glob'
import fs from 'fs-extra'

import tinifier from './tinifier'
import log from './utils/log'

export default function (options) {
  let {pattern, dest} = options

  let resources = []
    .concat(pattern)
    .map(f => glob.sync(f))
    .reduce((ret, arr) => ret.concat(arr), [])

  let handleError = console.log.bind(console)
  let imgP = function (img) {
    return tinifier(img.buffer)
      .then(
        ret => Promise.resolve(Object.assign({}, img, ret))
      )
      .catch(error => (
        Promise.reject({
          error,
          ...img
        })
      ))
  }

  let outputP = function (img) {
    let {path, buffer, size, origin, level} = img
    fs.writeFileSync(path, buffer, {
      encoding: 'binary'
    })

    log.build(path, level)
  }

  let resourcesP = resources
    .map(f => ({
      path: f,
      buffer: fs.readFileSync(f)
    }))
    .map(imgP)
    .map(p => p.then(outputP))
    .map(p => p.catch(handleError))

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
