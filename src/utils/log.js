import colors from 'colors'

let state = true

const log = function (msg) {
  /* istanbul ignore next */
  process.env.NODE_ENV !== 'test' && state && console.log(msg)
}

log.info = function (msg) {
  log('  ' + msg)
}

log.warn = function (msg) {
  log('  WARN: ' + colors.yellow(msg))
}

log.error = function (msg) {
  log('  ERROR: ' + colors.red(msg))
}

log.build = function (path) {
  log.info('Compress ' + path)
}

log.statistic = function (msg) {
  log.info(msg.replace(/__([^_]+?)__/g, (match, $1) => colors.green($1)))
}

log.state = function (quiet) {
  state = !quiet
}

export default log
