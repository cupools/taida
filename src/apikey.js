import fs from 'fs-extra'
import path from 'path'
import child from 'child_process'

import log from './utils/log'

function read(keypath) {
  try {
    let json = fs.readJsonSync(keypath)
    let {apikeys} = json

    if (!apikeys.length) {
      log.warn('No apikeys found.')
      log.warn('$ tiny-apikey --add [key]')
    }

    return apikeys
  } catch (e) {
    if (e.errno === -2) {
      // file not exist
      write(keypath)
      log.warn(keypath + ' has built.')
      log.warn('$ tiny-apikey --add [key]')
    } else {
      log.error(e.message)
      log.warn('$ tiny-apikey --help')
    }

    return process.env.NODE_ENV !== 'testing' ? process.exit(1) : null
  }
}

function write(keypath, apikeys = []) {
  fs.outputJsonSync(keypath, {
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
    return (this.apikeys && this.apikeys[0]) || null
  },
  delete(key) {
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
