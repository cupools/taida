'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _apikey = require('../apikey');

var _apikey2 = _interopRequireDefault(_apikey);

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  add: function add(keys) {
    return _apikey2.default.add(keys).then(function (ret) {
      var success = ret.success;
      var fail = ret.fail;

      (0, _log2.default)('  %s bitmaps successful and %s failed', success.length, fail.length);
    }).catch(_log2.default.error.bind(_log2.default));
  },
  use: function use(key) {
    return _apikey2.default.use(key).then(function (k) {
      (0, _log2.default)('  set %s to use first', k);
    }).catch(function (k) {
      (0, _log2.default)('  %s is not exist', k);
    });
  },
  delete: function _delete(key) {
    return _apikey2.default.delete(key).then(function (k) {
      (0, _log2.default)('  delete %s successful', k);
    }).catch(function (k) {
      (0, _log2.default)('  %s is not exist', k);
    });
  },
  list: function list() {
    return _apikey2.default.list().then(function (keys) {
      if (keys.length) {
        (0, _log2.default)(keys.map(function (item, index) {
          return '  ' + index + '. ' + item.key + ' (' + (item.valid ? 'valid' : 'invalid') + (index === 0 ? ', default' : '') + ')';
        }).join('\n'));
      } else {
        (0, _log2.default)('  empty api keys\n  $ tiny-apikey add <keys>');
      }
    });
  },
  clear: function clear() {
    return _apikey2.default.clear().then(function () {
      (0, _log2.default)('  remove all api keys successful');
      (0, _log2.default)('  $ tiny-apikey add <keys>');
    });
  },
  supply: function supply() {
    return _apikey2.default.supply();
  },
  edit: function edit() {
    return _apikey2.default.edit();
  }
};