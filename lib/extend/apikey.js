'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function read(dbpath) {
  var apikeys = [];

  try {
    var db = _fsExtra2.default.readJsonSync(dbpath);
    apikeys.push.apply(apikeys, (0, _toConsumableArray3.default)(db.apikeys));

    if (!apikeys.length) {
      _log2.default.warn('No apikeys found.');
      _log2.default.warn('Please run `tiny apikey --add [apikey]` first or `tiny help apikey`.');
      return false;
    }
  } catch (e) {
    if (e.errno === -2) {
      // file not exist
      write(dbpath);

      _log2.default.warn(dbpath + 'has built.');
      _log2.default.warn('Please run `tiny apikey --add [apikey]` first or `tiny help apikey`.');
    } else {
      _log2.default.error(e.message);
      _log2.default.error('Try `tiny help apikey`');
    }

    return false;
  }
  return apikeys;
}

function write(dbpath) {
  var apikeys = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  _fsExtra2.default.outputJsonSync(dbpath, {
    apikeys: apikeys
  });
}

exports.default = {
  __path: _path2.default.resolve('.apikey'),
  __apikeys: null,
  get apikeys() {
    return this.__apikeys ? this.__apikeys : this.__apikeys = read(this.__path);
  },
  set apikeys(val) {
    return this.__apikeys;
  },
  add: function add() {
    var apikeys = this.apikeys;

    for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
      keys[_key] = arguments[_key];
    }

    var args = keys.reduce(function (ret, key) {
      if (apikeys.includes(key)) {
        _log2.default.error('The key `' + key.slice(0, 10) + '...` had been added.');
        return ret;
      }
      return [].concat(ret, key);
    }, []);

    if (args.length) {
      _log2.default.info(args.length + ' apikeys has been added successful and ' + (keys.length - args.length) + ' failed.');
    }
  },
  get: function get() {
    return this.apikeys[0];
  },
  del: function del(key) {
    var apikeys = this.apikeys;
    var index = isNaN(key) ? Number(key) : apikeys.indexOf(key);

    if (index != null) {
      apikeys.splice(index, 1);
      _log2.default.info('The apikey has been deleted.');
    } else {
      _log2.default.warn('The key `' + key + '` hasn\'t been added before.');
    }
  },
  clear: function clear() {
    this.apikeys.length = 0;
  },
  list: function list() {},
  edit: function edit() {
    _child_process2.default.exec('open ' + this.__path);
  },
  apply: function apply() {
    _child_process2.default.exec('open https://tinypng.com/developers');
  }
};