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

/**
 * API to control apikey
 */
exports.default = {
  __path: _path2.default.resolve('.apikey'),
  __apikeys: null,

  get apikeys() {
    if (this.__apikeys) {
      return this.__apikeys;
    }

    // return empty array for unexpected .apikey
    var json = read(this.__path);
    if (!json) {
      return [];
    }

    // revise invalid keys
    var now = Date.now();
    var needsUpdate = false;
    var revise = json.map(function (item) {
      if (!item.valid && now - item.date > 1 * 24 * 3600 * 1e3) {
        needsUpdate = true;
        return (0, _assign2.default)({}, item, {
          valid: true,
          date: now
        });
      }
      return item;
    });

    // update .apikey
    if (needsUpdate) {
      write(this.__path, revise);
    }

    // save keys to instance, no matter empty array or not
    this.__apikeys = revise;
    return this.__apikeys;
  },

  set apikeys(val) {
    return this.__apikeys;
  },

  get: function get() {
    var apikeys = this.apikeys;

    var alternate = apikeys ? apikeys.filter(function (item) {
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
      _log2.default.warn('no valid apikey currently');
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
        _log2.default.error('the key `' + key.slice(0, 10) + '...` had been added.');
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
    var apikeys = this.__apikeys;
    var index = isNaN(key) ? Number(key) : apikeys.indexOf(key);

    if (index != null) {
      apikeys.splice(index, 1);
      _log2.default.info('the apikey has been deleted.');
    } else {
      _log2.default.warn('the key `' + key + '` hasn\'t been added before.');
    }

    return this;
  },
  clear: function clear() {
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


function read(keypath) {
  try {
    var json = _fsExtra2.default.readJsonSync(keypath);
    var apikeys = json.apikeys;


    if (!apikeys.length) {
      _log2.default.warn('no apikeys found.');
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
    return null;
  }
}

function write(keypath) {
  var apikeys = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  _fsExtra2.default.outputJsonSync(keypath, {
    apikeys: apikeys
  });
}