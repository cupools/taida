import apikey from '../apikey'
import log from '../utils/log'

export default {
  add(keys) {
    let success = apikey.add(keys) || []
    let fail = [].concat(keys).filter(key => !Array.includes(success, key))

    log.info('%s bitmaps successful and %s failed', success.length, fail.length)
  },
  use(key) {
    return apikey.use(key)
      ? log.info('set %s to use first', key)
      : log.info('%s is not exist', key)
  },
  delete(key) {
    return apikey.delete(key)
      ? log.info('delete %s successful', key)
      : log.info('%s is not exist', key)
  },
  list() {
    let keys = apikey.list()
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
    return apikey.clear() && log.info('remove all api keys successful. try _$ tiny-apikey add <keys>_')
  },
  supply() {
    return apikey.supply()
  },
  edit() {
    return apikey.edit()
  }
}
