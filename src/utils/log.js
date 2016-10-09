import colors from 'colors'

const log = function (...args) {
  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'testing' && log.active) {
    // eslint-disable-next-line no-console
    console.log(...args)
  }
}

log.active = true

log.info = function (...args) {
  log('  ' + render(args[0]), ...args.slice(1))
}

log.warn = function (...args) {
  log.info(
    colors.yellow('warn: ' + args[0]),
    ...args.slice(1)
  )
}

log.error = function (...args) {
  log.info(
    colors.red('error: ' + args[0]),
    ...args.slice(1)
  )
}

function render(str) {
  return String.includes(str, '_')
    ? str
    : str
      .replace(/___([\w\W]+?)___/, (_, p1) => p1.green)
      .replace(/__([\w\W]+?)__/, (_, p1) => p1.bold)
      .replace(/_([\w\W]+?)_/, (_, p1) => p1.italic)
}

export default log
