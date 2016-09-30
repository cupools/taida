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
    var json = this.__read();
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
      this.__write(revise);
    }

    // save keys to instance, no matter empty array or not
    this.__apikeys = revise;
    return this.__apikeys;
  },

  set apikeys(val) {
    return this.__apikeys;
  },

  get: function get() {
    var alternate = this.apikeys.filter(function (item) {
      return item.valid;
    });
    return alternate.length ? alternate[0].key : null;
  },
  depress: function depress(key) {
    var index = this.__apikeys.map(function (item) {
      return item.key;
    }).indexOf(key);

    if (this.__apikeys[index].valid) {
      this.__apikeys[index].valid = false;
      this.__apikeys[index].date = Date.now();

      this.__write(this.__apikeys);
    }
  },
  add: function add(args) {
    var apikeys = this.apikeys;

    var keys = [].concat(args);

    // TODO, api key validation
    var revise = keys.reduce(function (ret, key) {
      if (apikeys.filter(function (item) {
        return item.key === key;
      }).length) {
        _log2.default.error('the key `' + key.slice(0, 10) + '...` had been added.');
        return ret;
      }
      return [].concat(ret, key);
    }, []).map(function (key) {
      return {
        key: key,
        date: Date.now(),
        valid: true
      };
    });

    this.__write([].concat(apikeys, revise));
    _log2.default.info(revise.length + ' apikeys has been added successful and ' + (keys.length - revise.length) + ' fails');

    return this;
  },
  delete: function _delete(key) {
    var apikeys = this.apikeys;

    var index = apikeys.reduce(function (ret, item, idx) {
      return item.key === key ? idx : ret;
    }, null);

    if (index == null) {
      _log2.default.warn('the key `' + key + '` hasn\'t been added before.');
    } else {
      this.__write(apikeys.slice(0, index).concat(apikeys.slice(index + 1)));
      _log2.default.info('the apikey has been deleted.');
    }

    return this;
  },
  clear: function clear() {
    this.__apikeys = [];
    this.__write([]);
    return this;
  },
  list: function list() {
    var stdout = this.apikeys.reduce(function (ret, obj, index) {
      return [].concat(ret, index + '. ' + obj.key);
    }, []).map(function (str) {
      return '\n  ' + str;
    });
    _log2.default.info(stdout.join(''));

    return this;
  },
  edit: function edit() {
    this.__write([]);
    open(this.__path);
  },
  supply: function supply() {
    open('https://tinypng.com/developers');
  },
  __read: function __read() {
    return read(this.__path);
  },
  __write: function __write(apikeys) {
    return write(this.__path, apikeys);
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
      write(keypath, []);
      _log2.default.warn(keypath + ' has built.');
      _log2.default.warn('$ tiny-apikey --add [key]');
    } else {
      _log2.default.error(e.message);
      _log2.default.warn('$ tiny-apikey --help');
    }
    return null;
  }
}

function write(keypath, apikeys) {
  _fsExtra2.default.outputJsonSync(keypath, {
    apikeys: apikeys
  });
}

/* istanbul ignore next */
function open(p) {
  var cmd = 'open';
  switch (process.platform) {
    case 'wind32':
      cmd = 'start';
      break;
    case 'linux':
      cmd = 'xdg-open';
      break;
    default:
      cmd = 'open';
      break;
  }

  _child_process2.default.exec(cmd + ' ' + p);
}