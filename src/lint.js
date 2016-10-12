import assert from './utils/assert'

const schemes = [{
  param: 'pattern',
  necessary: true
}, {
  param: 'dest',
  typeOf: String
}]

export default function (opt) {
  return schemes.every(rule => {
    let { param, typeOf, necessary } = rule
    let actual = opt[param]
    let ret = true

    /* istanbul ignore next */
    if (actual !== undefined && typeOf) {
      ret = ret && assert.typeOf(actual, typeOf, `expect \`${param}\` to be ${typeOf.name} but get \`${actual}\``)
    }
    if (necessary) {
      ret = ret && assert.isNotNull(actual, `expect \`${param}\` to not be null or undefined`)
    }

    return ret
  })
}
