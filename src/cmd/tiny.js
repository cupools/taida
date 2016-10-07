import Path from 'path'
import fs from 'fs-extra'
import glob from 'glob'

import main from '../index'
import log from '../utils/log'
import pkg from '../../package.json'

const BACKUP_PATH = Path.join(__dirname, '../..', '.backup')

export default {
  main(options) {
    let resources = []
      .concat(options.pattern)
      .map(f => glob.sync(f))
      .reduce((ret, arr) => ret.concat(arr), [])

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
    let items = glob.sync('**/*.*', {
      cwd: BACKUP_PATH
    })

    if (items.length) {
      items.forEach(path => {
        let realpath = Path.join(BACKUP_PATH, path)
        fs.copySync(realpath, path)
        log.info('%s has been restore', path)
      })
    } else {
      log.info('No usable backup now')
    }
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

function backup(imgs, isBackup) {
  if (!isBackup) {
    return Promise.resolve(imgs)
  }

  let success = imgs.filter(img => !img.error)
  if (success.length) {
    fs.emptyDirSync(BACKUP_PATH)

    success.forEach(img => {
      let {path, origin} = img
      fs.outputFileSync(Path.resolve(BACKUP_PATH, path), origin.buffer, {
        encoding: 'binary'
      })
    })
  }

  return Promise.resolve(imgs)
}

function handleError(error) {
  log.error(error.message)
}
