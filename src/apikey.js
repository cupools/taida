import checkin from 'checkin'
import fs from 'fs-extra'
import merge from 'lodash.merge'
import EventEmitter from 'events'
import { apikeyLint } from './lint'

/**
 * API to control apikey
 */
export default {
  __apikeys: [],
  __alternate: true,
  __eventEmitter: new EventEmitter(),
  get apikeys() {
    return this.__apikeys
  },
  set apikeys(apikeys) {
    return this.config({ apikeys, alternate: this.alternate }).__apikeys
  },
  get alternate() {
    return this.__alternate
  },
  set alternate(alternate) {
    return this.config({ alternate }).__alternate
  },
  config(opt) {
    const options = checkin(opt, merge(apikeyLint, {
      apikeys: { def: this.apikeys },
      alternate: { def: this.alternate }
    }))

    const { apikeys, alternate } = options
    const now = Date.now()

    const newVal = apikeys.map(
      item => {
        if (typeof item === 'string') {
          return {
            key: item,
            valid: true,
            date: now
          }
        } else if (!item.valid && now - item.date > 1 * 24 * 3600 * 1e3) {
          return {
            key: item.key,
            valid: true,
            date: now
          }
        }
        return {
          key: item.key,
          valid: item.valid,
          date: item.date
        }
      }
    )

    this.clear()
    this.__alternate = alternate
    this.__apikeys.push(...newVal)
    this.__eventEmitter.emit('config', this.__apikeys)
    return this
  },
  get() {
    const { apikeys, alternate } = this
    if (alternate) {
      let valids = apikeys.filter(item => item.valid)
      return valids.length ? valids[0].key : null
    }

    return (apikeys[0] && apikeys[0].valid) ? apikeys[0].key : null
  },
  list() {
    return this.apikeys
  },
  depress(key) {
    const { apikeys } = this
    const index = apikeys.map(item => item.key).indexOf(key)
    const item = apikeys[index]

    if (!item) {
      return false
    } else if (item.valid) {
      item.valid = false
      item.date = Date.now()
      this.__eventEmitter.emit('depress', key, this.__apikeys)
    }

    return key
  },
  add(args) {
    const { apikeys } = this
    const keys = apikeys.map(item => item.key)
    const success = []
      .concat(args)
      .reduce(
        (ret, key) => (Array.includes(keys, key) ? ret : ret.concat(key)),
        []
      )

    if (!success.length) {
      return false
    }

    this.config({ apikeys: apikeys.concat(success) })
    return success
  },
  remove(args) {
    const { apikeys } = this
    const keys = apikeys.map(item => item.key)
    const success = []
      .concat(args)
      .reduce(
        (ret, key) => (Array.includes(keys, key) ? ret.concat(key) : ret),
        []
      )

    if (!success.length) {
      return false
    }

    this.config({ apikeys: apikeys.filter(item => !Array.includes(success, item.key)) })
    return success
  },
  clear() {
    this.__apikeys.splice(0, this.__apikeys.length)
    return this.__apikeys
  },
  fromArray(apikeys) {
    return this.config({ apikeys })
  },
  fromJSONFile(filepath, key = 'apikeys') {
    const json = fs.readJSONSync(filepath)
    return this.fromArray(json[key])
  }
}
