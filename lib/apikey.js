'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _log = require('./utils/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function read(keypath) {
  try {
    var json = _fsExtra2.default.readJsonSync(keypath);
    var apikeys = json.apikeys;


    if (!apikeys.length) {
      _log2.default.warn('No apikeys found.');
      _log2.default.warn('$ tiny-apikey --add [key]');
    }

    return apikeys;
  } catch (e) {
    if (e.errno === -2) {
      // file not exist
      write(keypath);
      _log2.default.warn(keypath + ' has built.');
      _log2.default.warn('$ tiny-apikey --add [key]');
    } else {
      _log2.default.error(e.message);
      _log2.default.warn('$ tiny-apikey --help');
    }

    return process.env.NODE_ENV !== 'testing' ? process.exit(1) : null;
  }
}

function write(keypath) {
  var apikeys = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  _fsExtra2.default.outputJsonSync(keypath, {
    apikeys: apikeys
  });
}

exports.default = {
  __path: _path2.default.resolve('.apikey'),
  __apikeys: null,

  get apikeys() {
    if (this.__apikeys) {
      return this.apikeys;
    }

    // get apikeys and revise invalid keys
    var now = Date.now();
    var json = read(this.__path);
    var needUpdate = false;
    var revise = json.map(function (item) {
      if (!item.valid && now - item.date > 1 * 24 * 3600 * 1e3) {
        needUpdate = true;
        return (0, _assign2.default)({}, item, {
          valid: true,
          date: now
        });
      }
      return item;
    });

    // update .apikey
    if (needUpdate) {
      write(this.__path, revise);
    }

    // save keys to instance
    if (revise) {
      this.__apikeys = revise;
    }

    return this.__apikeys;
  },

  set apikeys(val) {
    return this.__apikeys;
  },

  get: function get() {
    var alternate = this.apikeys ? this.apikeys.filter(function (item) {
      return item.valid;
    }) : [];
    return alternate.length ? alternate[0].key : null;
  },
  depress: function depress() {
    var target = this.get();

    if (target) {
      var index = this.__apikeys.map(function (item) {
        return item.key;
      }).indexOf(target);

      this.__apikeys[index].valid = false;
      this.__apikeys[index].date = Date.now();

      write(this.__path, this.__apikeys);
    } else {
      _log2.default.warn('No valid apikey currently');
    }
  },
  add: function add() {
    var apikeys = this.apikeys;

    // TODO, arguments' validation

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

    return this;
  },
  delete: function _delete(key) {
    var apikeys = this.apikeys;
    var index = isNaN(key) ? Number(key) : apikeys.indexOf(key);

    if (index != null) {
      apikeys.splice(index, 1);
      _log2.default.info('The apikey has been deleted.');
    } else {
      _log2.default.warn('The key `' + key + '` hasn\'t been added before.');
    }

    return this;
  },
  clear: function clear() {
    this.apikeys.length = 0;
    return this;
  },
  list: function list() {
    return this;
  },
  edit: function edit() {
    _child_process2.default.exec('open ' + this.__path);
  },
  supply: function supply() {
    _child_process2.default.exec('open https://tinypng.com/developers');
  }
};