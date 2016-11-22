'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var lint = exports.lint = {
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

var apikeyLint = exports.apikeyLint = {
  apikeys: {
    typeOf: ['string', 'array'],
    coerce: function coerce(val) {
      return val ? [].concat(val) : [];
    }
  },
  alternate: {
    coerce: function coerce(val) {
      return !!val;
    }
  }
};