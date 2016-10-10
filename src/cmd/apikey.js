import apikey from '../apikey'
import log from '../utils/log'

export default {
  add(keys) {
    return apikey
      .add(keys)
      .then(ret => {
        let {success, fail} = ret
        log.info('%s bitmaps successful and %s failed', success.length, fail.length)
      })
      .catch(log.error.bind(log))
  },
  use(key) {
    return apikey
      .use(key)
      .then(k => {
        log.info('set %s to use first', k)
      })
      .catch(k => {
        log.info('%s is not exist', k)
      })
  },
  delete(key) {
    return apikey
      .delete(key)
      .then(k => {
        log.info('delete %s successful', k)
      })
      .catch(k => {
        log.info('%s is not exist', k)
      })
  },
  list() {
    return apikey
      .list()
      .then(keys => {
        if (keys.length) {
          keys
            .map((item, index) => (
              index + '.' + item.key + ' ' + (item.valid ? '√'.green : '×'.red)
            ))
            .forEach(txt => log.info(txt))
        } else {
          log.info('empty api keys, try _$ tiny-apikey add <keys>_')
        }
      })
  },
  clear() {
    return apikey
      .clear()
      .then(() => {
        log.info('remove all api keys successful. try _$ tiny-apikey add <keys>_')
      })
  },
  supply() {
    return apikey.supply()
  },
  edit() {
    return apikey.edit()
  }
}
