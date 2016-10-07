import Path from 'path'
import fs from 'fs-extra'
import glob from 'glob'

import tinifier from './tinifier'
import lint from './lint'
import progress from './utils/progress'

export default function (options) {
  if (!lint(options)) {
    return Promise.reject('exit for unexpect options')
  }

  let {pattern, alternate} = options
  tinifier.apikey.alternate = alternate === undefined || !!alternate

  let resources = []
    .concat(pattern)
    .map(f => glob.sync(f))
    .reduce((ret, arr) => ret.concat(arr), [])

  if (!resources.length) {
    return Promise.reject('exit for no mapped bitmaps')
  }

  let bar = progress(resources.length)

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

  let outputP = function (dest) {
    return img => {
      bar.tick()

      if (img.error) {
        return Promise.resolve(img)
      }

      let {path, buffer} = img
      let output = dest ? Path.join(dest, Path.basename(path)) : path

      writeFile(output, buffer)

      return Promise.resolve(img)
    }
  }

  let resourcesP = resources
    .map(wrapImg)
    .map(compressP)
    .map(p => p.then(outputP(options.dest)))

  return Promise
    .all(resourcesP)
}
