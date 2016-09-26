import fs from 'fs-extra'
import path from 'path'
import child from 'child_process'

import log from '../utils/log'

function read(dbpath) {
  let apikeys = []

  try {
    let db = fs.readJsonSync(dbpath)
    apikeys.push(...db.apikeys)

    if (!apikeys.length) {
      log.warn('No apikeys found.')
      log.warn('Please run `tiny apikey --add [apikey]` first or `tiny help apikey`.')
      return false
    }
  } catch (e) {
    if (e.errno === -2) {
      // file not exist
      write(dbpath)

      log.warn(dbpath + 'has built.')
      log.warn('Please run `tiny apikey --add [apikey]` first or `tiny help apikey`.')
    } else {
      log.error(e.message)
      log.error('Try `tiny help apikey`')
    }

    return false
  }
  return apikeys
}

function write(dbpath, apikeys = []) {
  fs.outputJsonSync(dbpath, {
    apikeys
  })
}

export default {
  __path: path.resolve('.apikey'),
  __apikeys: null,
  get apikeys() {
    return this.__apikeys ? this.__apikeys : (this.__apikeys = read(this.__path))
  },
  set apikeys(val) {
    return this.__apikeys
  },
  add(...keys) {
    let {apikeys} = this

    let args = keys.reduce(
      (ret, key) => {
        if (apikeys.includes(key)) {
          log.error(`The key \`${key.slice(0, 10)}...\` had been added.`)
          return ret
        }
        return [].concat(ret, key)
      },
      []
    )

    if (args.length) {
      log.info(`${args.length} apikeys has been added successful and ${keys.length - args.length} failed.`)
    }
  },
  get() {
    return this.apikeys[0]
  },
  del(key) {
    let apikeys = this.apikeys
    let index = isNaN(key) ? Number(key) : apikeys.indexOf(key)

    if (index != null) {
      apikeys.splice(index, 1)
      log.info('The apikey has been deleted.')
    } else {
      log.warn(`The key \`${key}\` hasn't been added before.`)
    }
  },
  clear() {
    this.apikeys.length = 0
  },
  list() {

  },
  edit() {
    child.exec(`open ${this.__path}`)
  },
  apply() {
    child.exec('open https://tinypng.com/developers')
  }
}
