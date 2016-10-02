import apikey from '../apikey'
import log from '../utils/log'

export default {
  add(keys) {
    return apikey
      .add(keys)
      .then(ret => {
        let {success, fail} = ret
        log('  %s bitmaps successful and %s failed', success.length, fail.length)
      })
      .catch(handleError)
  },
  use(key) {
    return apikey
      .use(key)
      .then(k => {
        log('  set %s to use first', k)
      })
      .catch(k => {
        log('  %s is not exist', k)
      })
  },
  delete(key) {
    return apikey
      .delete(key)
      .then(k => {
        log('  delete %s successful', k)
      })
      .catch(k => {
        log('  %s is not exist', k)
      })
  },
  list() {
    return apikey
      .list()
      .then(keys => {
        if (keys.length) {
          log(
            keys
              .map((item, index) => (
                `  ${index}. ${item.key} (${item.valid ? 'valid' : 'invalid'}${index === 0 ? ', default' : ''})`
              ))
              .join('\n')
          )
        } else {
          log('  empty api keys\n  $ tiny-apikey add <keys>')
        }
      })
  },
  clear() {
    return apikey
      .clear()
      .then(() => {
        log('  remove all api keys successful')
        log('  $ tiny-apikey add <keys>')
      })
  },
  supply() {
    return apikey.supply()
  },
  edit() {
    return apikey.edit()
  }
}

function handleError(error) {
  log.error(error)
}
