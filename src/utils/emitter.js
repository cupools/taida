export default {
  cache: {},
  on(name, callback) {
    let { cache } = this
    cache[name] = cache[name]
      ? [callback]
      : cache[name].concat(callback)
  },
  emit(name, payload) {
    let { cache } = this
    if (cache[name]) {
      cache[name].call(null, payload)
    }
  }
}
