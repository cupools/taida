import path from 'path'
import fs from 'fs-extra'
import apikey from '../apikey'
import log from '../utils/log'

export default {
  __path: path.join(__dirname, '../../', '.apikey'),
  add(keys) {
    this.initKeys()
    const success = apikey.add(keys) || []
    const fail = [].concat(keys).filter(key => !Array.includes(success, key))

    if (success.length) {
      this.__write(apikey.apikeys)
    }

    log.info('%s bitmaps successful and %s failed', success.length, fail.length)
  },
  delete(keys) {
    this.initKeys()
    const success = apikey.remove(keys) || []
    const fail = [].concat(keys).filter(key => !Array.includes(success, key))

    if (success.length) {
      this.__write(apikey.apikeys)
    }

    log.info('delete %s successful and %s failed', success.length, fail.length)
  },
  list() {
    this.initKeys()
    const keys = apikey.list()

    if (keys.length) {
      keys
        .map((item, index) => (
          index + '.' + item.key + ' ' + (item.valid ? '√'.green : '×'.red)
        ))
        .forEach(txt => log.info(txt))
    } else {
      log.info('empty api keys, try _$ tiny-apikey add <keys>_')
    }
  },
  clear() {
    this.initKeys()

    this.__write()
    log.info('delete %s api keys successful. try _$ tiny-apikey add <keys>_', apikey.apikeys.length)
  },
  addListener() {
    const emitter = apikey.__eventEmitter
    emitter.on('config', apikeys => this.__write(apikeys))
    emitter.on('depress', (key, apikeys) => this.__write(apikeys))
  },
  initKeys() {
    const apikeys = this.__read()
    apikey.config({ apikeys })
  },
  __read() {
    return read(this.__path)
  },
  __write(apikeys = []) {
    return write(this.__path, apikeys)
  }
}

function read(keypath) {
  try {
    const json = fs.readJSONSync(keypath)
    const { apikeys } = json

    return apikeys
  } catch (e) {
    if (e.errno === -2) {
      // file not exist
      write(keypath, [])
      return null
    }
    throw e
  }
}

function write(keypath, apikeys) {
  fs.outputJsonSync(keypath, { apikeys })
}
