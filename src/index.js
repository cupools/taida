import Path from 'path'
import fs from 'fs-extra'
import glob from 'glob'
import checkin from 'checkin'

import './utils/progress'
import apikey from './apikey'
import taida from './taida'
import { lint } from './lint'
import emitter from './utils/emitter'

export default function (opt) {
  let options = null

  try {
    options = checkin(opt, lint)
  } catch (e) {
    return Promise.reject(e)
  }

  const { pattern, alternate, apikeys, dest } = options
  apikey.config({ alternate, apikeys })

  const isBitmap = p => /\.(jpg|jpeg|png)$/.test(p)
  const resources = Array.from(new Set(
    [].concat(pattern)
      .map(f => glob.sync(f))
      .reduce((ret, arr) => ret.concat(arr), [])
      .filter(isBitmap)
  ))

  if (!resources.length) {
    return Promise.reject(new Error('exit for no matched bitmaps'))
  }

  if (options.progress) emitter.emit('bar.init', resources.length)

  const readFile = path => fs.readFileSync(path)
  const writeFile = (path, buffer) => fs.outputFileSync(path, buffer, { encoding: 'binary' })
  const wrapImg = path => ({ path, buffer: readFile(path) })

  const compressP = function (img) {
    const key = apikey.get()
    const buffer = img.buffer
    const fallback = () => {
      apikey.depress(key)
      return taida(apikey.get(), buffer, fallback)
    }

    return taida(key, buffer, fallback)
      .then(
        ret => Promise.resolve(Object.assign({}, img, ret))
      )
      .catch(
        error => Promise.resolve({
          ...img,
          error
        })
      )
  }

  const outputP = function (outputDir, img) {
    emitter.emit('bar.progress')

    if (img.error) {
      return Promise.resolve(img)
    }

    const { path, buffer } = img
    const output = outputDir ? Path.join(outputDir, Path.basename(path)) : path
    writeFile(output, buffer)

    return Promise.resolve(img)
  }

  const resourcesP = resources
    .map(wrapImg)
    .map(img => compressP(img).then(outputP.bind(null, dest)))

  return Promise
    .all(resourcesP)
}
