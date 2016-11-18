'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  pattern: {
    required: true
  },
  dest: {
    def: '',
    typeOf: 'string'
  },
  alternate: {
    def: true,
    coerce: function coerce(val) {
      return val === undefined || !!val;
    }
  }
};