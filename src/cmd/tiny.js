import Path from 'path'
import fs from 'fs-extra'
import glob from 'glob'

import main from '../index'
import log from '../utils/log'
import pkg from '../../package.json'

const BACKUP_PATH = Path.join(__dirname, '../..', '.backup')
const BACKUP_FILE = Path.join(BACKUP_PATH, 'db.json')

export default {
  main(options) {
    let isBitmap = function (p) {
      return /\.(jpg|jpeg|png)$/.test(p)
    }

    let resources = []
      .concat(options.pattern)
      .map(f => glob.sync(f))
      .reduce((ret, arr) => ret.concat(arr), [])
      .filter(isBitmap)

    log.info(`\n  __taida    version: ${pkg.version}__\n`)

    if (resources.length) {
      log.info(`Found ${resources.length} bitmaps and starting...`)
    }

    return main(options)
      .then(imgs => backup(imgs, options.backup))
      .then(imgs => statistics(imgs, options.detail))
      .catch(handleError)
  },
  restore() {
    return restore()
  }
}

function statistics(imgs, detail) {
  let success = imgs.filter(img => !img.error)
  let fails = imgs.filter(img => !!img.error)
  let total = success.reduce((ret, img) => ret + img.size, 0)
  let originTotal = success.reduce((ret, img) => ret + img.origin.size, 0)
  let fix = num => (num / 1000).toFixed(2)

  log.info(`Compress ___${success.length} bitmaps___ successful and ${fails.length} fails.`)

  if (success.length) {
    log.info(`From ${fix(originTotal)}kb to ${fix(total)}kb, saving ___${fix(1e5 - total / originTotal * 1e5)}%___.\n`)
  }

  if (detail) {
    log.info('Results: ')
    success.forEach(img => log.info('___√___ %s: %skb -> %skb', img.path, fix(img.origin.size), fix(img.size)))
  }

  fails.forEach(img => log.info('× %s: %s'.red, img.path, img.error.message))

  return Promise.resolve(imgs)
}

function restore() {
  if (!fs.existsSync(BACKUP_FILE)) {
    log.warn('No usable backup now')
    return
  }

  let db = fs.readJSONSync(BACKUP_FILE)
  db.forEach(item => {
    let { path, backup } = item
    fs.copySync(backup, path)
    log.info('%s has been restore', path)
  })
}

function backup(imgs, isBackup) {
  fs.emptyDirSync(BACKUP_PATH) // clear dir to avoid unexpect restore

  if (!isBackup) {
    return Promise.resolve(imgs)
  }

  let success = imgs.filter(img => !img.error)
  let db = success.reduce(
    (ret, img, index) => {
      let { path, origin } = img
      let basename = index + Path.basename(path)
      let output = Path.resolve(BACKUP_PATH, basename)
      let option = { encoding: 'binary' }

      fs.outputFileSync(output, origin.buffer, option)

      return ret.concat({
        path: Path.resolve(path),
        backup: output
      })
    },
    []
  )
  fs.outputJSONSync(BACKUP_FILE, db)
  return Promise.resolve(imgs)
}

function handleError(error) {
  log.error(error.message)
}
