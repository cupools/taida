'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (opt) {
  return schemes.every(function (rule) {
    var param = rule.param;
    var typeOf = rule.typeOf;
    var necessary = rule.necessary;

    var actual = opt[param];
    var ret = true;

    /* istanbul ignore next */
    if (actual !== undefined && typeOf) {
      ret = ret && _assert2.default.typeOf(actual, typeOf, 'expect `' + param + '` to be ' + typeOf.name + ' but get `' + actual + '`');
    }
    if (necessary) {
      ret = ret && _assert2.default.isNotNull(actual, 'expect `' + param + '` to not be null or undefined');
    }

    return ret;
  });
};

var _assert = require('./utils/assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var schemes = [{
  param: 'pattern',
  necessary: true
}, {
  param: 'dest',
  typeOf: String
}];