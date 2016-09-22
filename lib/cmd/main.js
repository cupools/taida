'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  return _index2.default.apply(undefined, arguments).then(function (data) {
    return _log2.default.build(data.path);
  }).catch(function (error) {
    return _log2.default.error(error);
  });
};

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }