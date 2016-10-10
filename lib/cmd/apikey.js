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

      _log2.default.info('%s bitmaps successful and %s failed', success.length, fail.length);
    }).catch(_log2.default.error.bind(_log2.default));
  },
  use: function use(key) {
    return _apikey2.default.use(key).then(function (k) {
      _log2.default.info('set %s to use first', k);
    }).catch(function (k) {
      _log2.default.info('%s is not exist', k);
    });
  },
  delete: function _delete(key) {
    return _apikey2.default.delete(key).then(function (k) {
      _log2.default.info('delete %s successful', k);
    }).catch(function (k) {
      _log2.default.info('%s is not exist', k);
    });
  },
  list: function list() {
    return _apikey2.default.list().then(function (keys) {
      if (keys.length) {
        keys.map(function (item, index) {
          return index + '.' + item.key + ' ' + (item.valid ? '√'.green : '×'.red);
        }).forEach(function (txt) {
          return _log2.default.info(txt);
        });
      } else {
        _log2.default.info('empty api keys, try _$ tiny-apikey add <keys>_');
      }
    });
  },
  clear: function clear() {
    return _apikey2.default.clear().then(function () {
      _log2.default.info('remove all api keys successful. try _$ tiny-apikey add <keys>_');
    });
  },
  supply: function supply() {
    return _apikey2.default.supply();
  },
  edit: function edit() {
    return _apikey2.default.edit();
  }
};