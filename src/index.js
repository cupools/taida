import Path from 'path'
import fs from 'fs-extra'
import glob from 'glob'
import R from 'ramda'

import tinifier from './tinifier'
import log from './utils/log'
import progress from './utils/progress'

export default function (options) {
  // TODO, argument validation
  let {pattern} = options
  let resources = []
    .concat(pattern)
    .map(f => glob.sync(f))
    .reduce((ret, arr) => ret.concat(arr), [])

  let bar = progress(resources.length)

  let handleError = R.curry(log.error, R.prop('message'))

  let readFile = function (path) {
    return fs.readFileSync(path)
  }

  let writeFile = function (path, buffer) {
    return fs.outputFileSync(path, buffer, {
      encoding: 'binary'
    })
  }

  let wrapImg = function (path) {
    return {
      path,
      buffer: readFile(path)
    }
  }

  let compressP = function (img) {
    return tinifier(img.buffer)
      .then(
        ret => Promise.resolve(Object.assign({}, img, ret))
      )
      .catch(
        error => Promise.resolve({
          error,
          ...img
        })
      )
  }

  let outputP = R.curry(
    (dest, img) => {
      bar.tick()

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
    .map(wrapImg)
    .map(compressP)
    .map(p => p.then(outputP(options.dest)))
    .map(p => p.catch(handleError))

  return Promise
    .all(resourcesP)
}
