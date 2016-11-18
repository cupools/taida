import Path from 'path'
import fs from 'fs-extra'
import glob from 'glob'
import proof from 'proof'

import apikey from './apikey'
import taida from './taida'
import lint from './lint'
import progress from './utils/progress'

export default function (opt) {
  const options = proof.peace(opt, lint)

  if (options.isError) {
    return Promise.reject(options)
  }

  const isBitmap = function (p) {
    return /\.(jpg|jpeg|png)$/.test(p)
  }

  let { pattern, alternate } = options
  apikey.alternate = alternate

  let resources = [...new Set(
    [].concat(pattern)
      .map(f => glob.sync(f))
      .reduce((ret, arr) => ret.concat(arr), [])
      .filter(isBitmap)
  )]

  if (!resources.length) {
    return Promise.reject(new Error('exit for no matched bitmaps'))
  }

  let bar = progress(resources.length, options.progress)

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

      let { path, buffer } = img
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
