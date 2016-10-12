import fs from 'fs-extra'
import path from 'path'
import child from 'child_process'

import log from './utils/log'

/**
 * API to control apikey
 */
export default {
  __path: path.join(__dirname, '../', '.apikey'),
  __apikeys: null,
  __alternate: true,

  get alternate() {
    return this.__alternate
  },

  set alternate(val) {
    this.__alternate = !!val
  },

  get apikeys() {
    if (this.__apikeys) {
      return this.__apikeys
    }

    let json = this.__read()

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

  set apikeys(keys) {
    let date = Date.now()
    let revise = [].concat(keys).map(key => ({
      date,
      key,
      valid: true,
      temporary: true
    }))
    this.__apikeys = revise
    return this.__apikeys
  },

  get() {
    let {apikeys} = this

    if (this.alternate) {
      let valids = apikeys.filter(item => item.valid)
      return valids.length ? valids[0].key : null
    }
    return (apikeys[0] && apikeys[0].valid) ? apikeys[0].key : null
  },

  depress(key) {
    let index = (this.__apikeys || this.apikeys).map(item => item.key).indexOf(key)

    if (!this.__apikeys[index]) {
      return false
    }

    let item = this.__apikeys[index]
    if (item.valid) {
      item.valid = false
      item.date = Date.now()

      if (!item.temporary) {
        this.__write(this.__apikeys)
      }
    }

    return key
  },

  add(args) {
    let {apikeys} = this
    let keys = apikeys.map(item => item.key)
    let success = []
      .concat(args)
      .reduce(
        (ret, key) => {
          if (Array.includes(keys, key)) {
            return ret
          }
          return ret.concat(key)
        },
        []
      )

    let revise = success
      .map(key => ({
        key,
        date: Date.now(),
        valid: true
      }))

    this.__apikeys = null
    this.__write(apikeys.concat(revise))

    return success.length ? success : false
  },

  use(key) {
    let {apikeys} = this
    let keys = apikeys.map(item => item.key)
    let index = isNaN(key)
      ? keys.indexOf(key)
      : Number(key)

    if (index == null || !apikeys[index]) {
      return false
    }

    this.__apikeys = null
    this.__write([apikeys[index], ...apikeys.slice(0, index), ...apikeys.slice(index + 1)])
    return keys[index]
  },

  delete(key) {
    let {apikeys} = this
    let keys = apikeys.map(item => item.key)
    let index = isNaN(key)
      ? keys.indexOf(key)
      : Number(key)

    if (index == null || !apikeys[index]) {
      return false
    }

    this.__apikeys = null
    this.__write(apikeys.slice(0, index).concat(apikeys.slice(index + 1)))
    return keys[index]
  },

  clear() {
    this.__apikeys = null
    this.__write([])
    return []
  },

  list() {
    return this.apikeys
  },

  edit() {
    open(this.__path)
  },

  supply() {
    open('https://tinypng.com/developers')
  },

  __read() {
    return read(this.__path) || []
  },

  __write(apikeys) {
    return write(this.__path, apikeys.filter(key => !key.temporary))
  }
}

function read(keypath) {
  try {
    let json = fs.readJsonSync(keypath)
    let { apikeys } = json

    return apikeys
  } catch (e) {
    if (e.errno === -2) {
      // file not exist
      write(keypath, [])
      log.warn(keypath + ' has built, exec: _$ tiny-apikey add <keys>_')
    } else {
      log.error(e.message)
    }
    return null
  }
}

function write(keypath, apikeys) {
  fs.outputJsonSync(keypath, {
    apikeys
  })
}

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
