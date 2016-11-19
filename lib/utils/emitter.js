"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  cache: {},
  on: function on(name, callback) {
    var cache = this.cache;

    cache[name] = cache[name] ? [callback] : cache[name].concat(callback);
  },
  emit: function emit(name, payload) {
    var cache = this.cache;

    if (cache[name]) {
      cache[name].call(null, payload);
    }
  }
};