import Path from 'path'
import fs from 'fs-extra'
import glob from 'glob'

import taida from './taida'
import lint from './lint'
import progress from './utils/progress'

export default function (options) {
  if (!lint(options)) {
    return Promise.reject(new Error('exit for unexpect options'))
  }

  let {pattern, alternate} = options
  taida.apikey.alternate = alternate === undefined || !!alternate

  let resources = [...new Set(
    []
      .concat(pattern)
      .map(f => glob.sync(f))
      .reduce((ret, arr) => ret.concat(arr), [])
  )]

  if (!resources.length) {
    return Promise.reject(new Error('exit for no matched bitmap'))
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
    return taida(img.buffer)
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
