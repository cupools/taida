export default {
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
