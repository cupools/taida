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
    if (this.__apikeys) {
      return this.apikeys
    }

    // get apikeys and revise invalid keys
    let now = Date.now()
    let json = read(this.__path)
    let needUpdate = false
    let revise = json.map(item => {
      if (!item.valid && now - item.date > 1 * 24 * 3600 * 1e3) {
        needUpdate = true
        return Object.assign({}, item, {
          valid: true,
          date: now
        })
      }
      return item
    })

    // update .apikey
    if (needUpdate) {
      write(this.__path, revise)
    }

    // save keys to instance
    if (revise) {
      this.__apikeys = revise
    }

    return this.__apikeys
  },

  set apikeys(val) {
    return this.__apikeys
  },

  get() {
    let alternate = this.apikeys ? this.apikeys.filter(item => item.valid) : []
    return alternate.length ? alternate[0].key : null
  },

  depress() {
    let target = this.get()

    if (target) {
      let index = this.__apikeys.map(item => item.key).indexOf(target)

      this.__apikeys[index].valid = false
      this.__apikeys[index].date = Date.now()

      write(this.__path, this.__apikeys)
    } else {
      log.warn('No valid apikey currently')
    }
  },

  add(...keys) {
    let {apikeys} = this

    // TODO, arguments' validation
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

    return this
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

    return this
  },

  clear() {
    this.apikeys.length = 0
    return this
  },

  list() {
    return this
  },

  edit() {
    child.exec(`open ${this.__path}`)
  },

  supply() {
    child.exec('open https://tinypng.com/developers')
  }
}
