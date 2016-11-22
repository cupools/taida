export const lint = {
  pattern: {
    required: true
  },
  dest: {
    def: '',
    typeOf: 'string'
  },
  alternate: {
    def: true,
    coerce: (val) => val === undefined || !!val
  }
}

export const apikeyLint = {
  apikeys: {
    typeOf: ['string', 'array'],
    coerce: val => (val ? [].concat(val) : [])
  },
  alternate: {
    coerce: val => !!val
  }
}
