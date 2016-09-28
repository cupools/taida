import R from 'ramda'

import main from '../index'
import log from '../utils/log'
import pkg from '../../package.json'

export default function (options) {
  log(`  Tinifier    version: ${pkg.version}`.bold)

  let handleError = R.curry(log.error, R.prop('message'))

  let statistics = R.curry(imgs => {
    let success = imgs.filter(img => !img.error)
    let fails = imgs.filter(img => !!img.error)
    let total = success.reduce((ret, img) => ret + img.size, 0)
    let originTotal = success.reduce((ret, img) => ret + img.origin.size, 0)
    let fix = num => (num / 1000).toFixed(2)

    log.statistic(`Compress __${success.length} bitmaps__ successful and ${fails.length} fails.`)
    log.statistic(`From ${fix(originTotal)}kb to ${fix(total)}kb, saving __${fix(1e5 - total / originTotal * 1e5)}%__.`)

    if (options.detail) {
      log('  Results: ')
      success.forEach(img => log.info([img.path, `${fix(img.origin.size)}kb -> ${fix(img.size)}kb`].join(': ')))
    }

    fails.forEach(img => log.error([img.path, img.error.message].join(': ')))

    return Promise.resolve(imgs)
  })

  return main(options)
    .then(statistics)
    .catch(handleError)
}
