import Path from 'path'
import fs from 'fs-extra'
import glob from 'glob'
import proof from 'proof'

import apikey from './apikey'
import taida from './taida'
import progress from './utils/progress'
import { lint } from './lint'

export default function (opt) {
  const options = proof.peace(opt, lint)

  if (options.isError) {
    return Promise.reject(options)
  }

  const isBitmap = function (p) {
    return /\.(jpg|jpeg|png)$/.test(p)
  }

  const { pattern, alternate } = options
  apikey.alternate = alternate

  const resources = [...new Set(
    [].concat(pattern)
      .map(f => glob.sync(f))
      .reduce((ret, arr) => ret.concat(arr), [])
      .filter(isBitmap)
  )]

  if (!resources.length) {
    return Promise.reject(new Error('exit for no matched bitmaps'))
  }

  const bar = progress(resources.length, options.progress)

  const readFile = function (path) {
    return fs.readFileSync(path)
  }

  const writeFile = function (path, buffer) {
    return fs.outputFileSync(path, buffer, {
      encoding: 'binary'
    })
  }

  const wrapImg = function (path) {
    return {
      path,
      buffer: readFile(path)
    }
  }

  const compressP = function (img) {
    const key = apikey.get()
    const fallback = () => {
      apikey.depress(key)
      return taida(apikey.get(), img.buffer, fallback)
    }

    return taida(key, img.buffer, fallback)
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

  const outputP = function (dest) {
    return img => {
      bar.tick()

      if (img.error) {
        return Promise.resolve(img)
      }

      const { path, buffer } = img
      const output = dest ? Path.join(dest, Path.basename(path)) : path

      writeFile(output, buffer)

      return Promise.resolve(img)
    }
  }

  const resourcesP = resources
    .map(wrapImg)
    .map(compressP)
    .map(p => p.then(outputP(options.dest)))

  return Promise
    .all(resourcesP)
}
