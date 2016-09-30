import fs from 'fs-extra'
import path from 'path'
import child from 'child_process'

import log from './utils/log'

/**
 * API to control apikey
 */
export default {
  __path: path.resolve('.apikey'),
  __apikeys: null,

  get apikeys() {
    if (this.__apikeys) {
      return this.__apikeys
    }

    // return empty array for unexpected .apikey
    let json = this.__read()
    if (!json) {
      return []
    }

    // revise invalid keys
    let now = Date.now()
    let needsUpdate = false
    let revise = json.map(item => {
      if (!item.valid && now - item.date > 1 * 24 * 3600 * 1e3) {
        needsUpdate = true
        return Object.assign({}, item, {
          valid: true,
          date: now
        })
      }
      return item
    })

    // update .apikey
    if (needsUpdate) {
      this.__write(revise)
    }

    // save keys to instance, no matter empty array or not
    this.__apikeys = revise
    return this.__apikeys
  },

  set apikeys(val) {
    return this.__apikeys
  },

  get() {
    let alternate = this.apikeys.filter(item => item.valid)
    return alternate.length ? alternate[0].key : null
  },

  depress(key) {
    let index = this.__apikeys.map(item => item.key).indexOf(key)

    if (this.__apikeys[index].valid) {
      this.__apikeys[index].valid = false
      this.__apikeys[index].date = Date.now()

      this.__write(this.__apikeys)
    }
  },

  add(args) {
    let {apikeys} = this
    let keys = [].concat(args)

    // TODO, api key validation
    let revise = keys
      .reduce(
        (ret, key) => {
          if (apikeys.filter(item => item.key === key).length) {
            log.error(`the key \`${key.slice(0, 10)}...\` had been added.`)
            return ret
          }
          return [].concat(ret, key)
        },
        []
      )
      .map(key => ({
        key,
        date: Date.now(),
        valid: true
      }))

    this.__write([].concat(apikeys, revise))
    log.info(`${revise.length} apikeys has been added successful and ${keys.length - revise.length} fails`)

    return this
  },

  delete(key) {
    let {apikeys} = this
    let index = apikeys.reduce((ret, item, idx) => (item.key === key ? idx : ret), null)

    if (index == null) {
      log.warn(`the key \`${key}\` hasn't been added before.`)
    } else {
      this.__write(apikeys.slice(0, index).concat(apikeys.slice(index + 1)))
      log.info('the apikey has been deleted.')
    }

    return this
  },

  clear() {
    this.__apikeys = []
    this.__write([])
    return this
  },

  list() {
    let stdout = this.apikeys
    .reduce(
      (ret, obj, index) => [].concat(ret, `${index}. ${obj.key}`),
      []
    )
    .map(str => '\n  ' + str)
    log.info(stdout.join(''))

    return this
  },

  edit() {
    this.__write([])
    open(this.__path)
  },

  supply() {
    open('https://tinypng.com/developers')
  },

  __read() {
    return read(this.__path)
  },

  __write(apikeys) {
    return write(this.__path, apikeys)
  }
}

function read(keypath) {
  try {
    let json = fs.readJsonSync(keypath)
    let {apikeys} = json

    if (!apikeys.length) {
      log.warn('no apikeys found.')
      log.warn('$ tiny-apikey --add [key]')
    }

    return apikeys
  } catch (e) {
    if (e.errno === -2) {
      // file not exist
      write(keypath, [])
      log.warn(keypath + ' has built.')
      log.warn('$ tiny-apikey --add [key]')
    } else {
      log.error(e.message)
      log.warn('$ tiny-apikey --help')
    }
    return null
  }
}

function write(keypath, apikeys) {
  fs.outputJsonSync(keypath, {
    apikeys
  })
}

/* istanbul ignore next */
function open(p) {
  let cmd = 'open'
  switch (process.platform) {
    case 'wind32':
      cmd = 'start'
      break
    case 'linux':
      cmd = 'xdg-open'
      break
    default:
      cmd = 'open'
      break
  }

  child.exec(cmd + ' ' + p)
}
