import glob from 'glob'
import fs from 'fs-extra'
import R from 'ramda'
import Path from 'path'

import tinifier from './tinifier'
import log from './utils/log'

export default function (options) {
  let {pattern} = options

  let resources = []
    .concat(pattern)
    .map(f => glob.sync(f))
    .reduce((ret, arr) => ret.concat(arr), [])

  // handleError :: String -> ()
  let handleError = R.curry(log.error, R.prop('message'))

  // readFile :: String -> String
  let readFile = function (path) {
    return fs.readFileSync(path)
  }

  // readFile :: String -> ()
  let writeFile = function (path, buffer) {
    return fs.outputFileSync(path, buffer, {
      encoding: 'binary'
    })
  }

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

  // outputP :: String -> img -> Promise img
  let outputP = R.curry(
    (dest, img) => {
      if (img.error) {
        return Promise.resolve(img)
      }

      let {path, buffer} = img
      let output = dest ? Path.join(dest, Path.basename(path)) : path

      writeFile(output, buffer)

      return Promise.resolve(img)
    }
  )

  let resourcesP = resources
    .map(f => ({
      path: f,
      buffer: readFile(f)
    }))
    .map(imgP)
    .map(p => p.then(outputP(options.dest)))
    .map(p => p.catch(handleError))

  let statistics = R.curry(imgs => {
    let success = imgs.filter(img => !img.error)
    let fails = imgs.filter(img => !!img.error)
    let total = imgs.reduce((ret, img) => ret + img.size, 0)
    let originTotal = imgs.reduce((ret, img) => ret + img.origin.size, 0)
    let fix = num => (num / 1000).toFixed(2)

    log.statistic(`Compress __${success.length} bitmaps__ successful and __${fails.length}__ fails.`)
    log.statistic(`From ${fix(originTotal)}kb to ${fix(total)}kb, saving __${fix(1e5 - total / originTotal * 1e5)}%__.`)
  })

  return Promise
    .all(resourcesP)
    .then(statistics)
    .catch(handleError)
}
