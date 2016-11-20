'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _includes = require('babel-runtime/core-js/array/includes');

var _includes2 = _interopRequireDefault(_includes);

var _apikey = require('../apikey');

var _apikey2 = _interopRequireDefault(_apikey);

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  add: function add(keys) {
    var success = _apikey2.default.add(keys) || [];
    var fail = [].concat(keys).filter(function (key) {
      return !(0, _includes2.default)(success, key);
    });

    _log2.default.info('%s bitmaps successful and %s failed', success.length, fail.length);
  },
  delete: function _delete(key) {
    return _apikey2.default.delete(key) ? _log2.default.info('delete %s successful', key) : _log2.default.info('%s is not exist', key);
  },
  list: function list() {
    var keys = _apikey2.default.list();
    if (keys.length) {
      keys.map(function (item, index) {
        return index + '.' + item.key + ' ' + (item.valid ? '√'.green : '×'.red);
      }).forEach(function (txt) {
        return _log2.default.info(txt);
      });
    } else {
      _log2.default.info('empty api keys, try _$ tiny-apikey add <keys>_');
    }
  },
  clear: function clear() {
    return _apikey2.default.clear() && _log2.default.info('remove all api keys successful. try _$ tiny-apikey add <keys>_');
  }
};