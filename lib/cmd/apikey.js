'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _includes = require('babel-runtime/core-js/array/includes');

var _includes2 = _interopRequireDefault(_includes);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _apikey = require('../apikey');

var _apikey2 = _interopRequireDefault(_apikey);

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

var _emitter = require('../utils/emitter');

var _emitter2 = _interopRequireDefault(_emitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  __path: _path2.default.join(__dirname, '../../', '.apikey'),
  add: function add(keys) {
    this.initKeys();
    var success = _apikey2.default.add(keys) || [];
    var fail = [].concat(keys).filter(function (key) {
      return !(0, _includes2.default)(success, key);
    });

    if (success.length) {
      this.__write(_apikey2.default.apikeys);
    }

    _log2.default.info('%s bitmaps successful and %s failed', success.length, fail.length);
  },
  delete: function _delete(keys) {
    this.initKeys();
    var success = _apikey2.default.remove(keys) || [];
    var fail = [].concat(keys).filter(function (key) {
      return !(0, _includes2.default)(success, key);
    });

    if (success.length) {
      this.__write(_apikey2.default.apikeys);
    }

    _log2.default.info('delete %s successful and %s failed', success.length, fail.length);
  },
  list: function list() {
    this.initKeys();
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
    this.initKeys();

    this.__write();
    _log2.default.info('delete %s api keys successful. try _$ tiny-apikey add <keys>_', _apikey2.default.apikeys.length);
  },
  addListener: function addListener() {
    var _this = this;

    _emitter2.default.on('apikey.config', function (apikeys) {
      return _this.__write(apikeys);
    });
    _emitter2.default.on('apikey.depress', function (key, apikeys) {
      return _this.__write(apikeys);
    });
  },
  initKeys: function initKeys() {
    var apikeys = this.__read();
    _apikey2.default.config({ apikeys: apikeys });
  },
  __read: function __read() {
    return read(this.__path);
  },
  __write: function __write() {
    var apikeys = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    return write(this.__path, apikeys);
  }
};


function read(keypath) {
  try {
    var json = _fsExtra2.default.readJSONSync(keypath);
    var apikeys = json.apikeys;


    return apikeys;
  } catch (e) {
    if (e.errno === -2) {
      // file not exist
      write(keypath, []);
      return null;
    }
    throw e;
  }
}

function write(keypath, apikeys) {
  _fsExtra2.default.outputJsonSync(keypath, { apikeys: apikeys });
}