'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _includes = require('babel-runtime/core-js/array/includes');

var _includes2 = _interopRequireDefault(_includes);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * API to control apikey
 * CRUD and cache
 */
exports.default = {
  __path: _path2.default.join(__dirname, '../', '.apikey'),
  __apikeys: null,
  __alternate: true,

  get alternate() {
    return this.__alternate;
  },

  set alternate(val) {
    this.__alternate = !!val;
  },

  get apikeys() {
    if (this.__apikeys) {
      return this.__apikeys;
    }

    var json = this.__read();

    // revise invalid keys
    var now = Date.now();
    var needsUpdate = false;

    var revise = json.map(function (item) {
      if (!item.valid && now - item.date > 1 * 24 * 3600 * 1e3) {
        needsUpdate = true;
        return (0, _extends3.default)({}, item, {
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

  set apikeys(keys) {
    var date = Date.now();
    var revise = [].concat(keys).map(function (key) {
      return {
        date: date,
        key: key,
        valid: true,
        temporary: true
      };
    });
    this.__apikeys = revise;
    return this.__apikeys;
  },

  get: function get() {
    var apikeys = this.apikeys;


    if (this.alternate) {
      var valids = apikeys.filter(function (item) {
        return item.valid;
      });
      return valids.length ? valids[0].key : null;
    }
    return apikeys[0] && apikeys[0].valid ? apikeys[0].key : null;
  },
  depress: function depress(key) {
    var index = (this.__apikeys || this.apikeys).map(function (item) {
      return item.key;
    }).indexOf(key);

    if (!this.__apikeys[index]) {
      return false;
    }

    var item = this.__apikeys[index];
    if (item.valid) {
      item.valid = false;
      item.date = Date.now();

      if (!item.temporary) {
        this.__write(this.__apikeys);
      }
    }

    return key;
  },
  add: function add(args) {
    var apikeys = this.apikeys;

    var keys = apikeys.map(function (item) {
      return item.key;
    });
    var success = [].concat(args).reduce(function (ret, key) {
      if ((0, _includes2.default)(keys, key)) {
        return ret;
      }
      return ret.concat(key);
    }, []);

    var revise = success.map(function (key) {
      return {
        key: key,
        date: Date.now(),
        valid: true
      };
    });

    this.__apikeys = null;
    this.__write(apikeys.concat(revise));

    return success.length ? success : false;
  },
  use: function use(key) {
    var apikeys = this.apikeys;

    var keys = apikeys.map(function (item) {
      return item.key;
    });
    var index = isNaN(key) ? keys.indexOf(key) : Number(key);

    if (index == null || !apikeys[index]) {
      return false;
    }

    this.__apikeys = null;
    this.__write([apikeys[index]].concat((0, _toConsumableArray3.default)(apikeys.slice(0, index)), (0, _toConsumableArray3.default)(apikeys.slice(index + 1))));
    return keys[index];
  },
  delete: function _delete(key) {
    var apikeys = this.apikeys;

    var keys = apikeys.map(function (item) {
      return item.key;
    });
    var index = isNaN(key) ? keys.indexOf(key) : Number(key);

    if (index == null || !apikeys[index]) {
      return false;
    }

    this.__apikeys = null;
    this.__write(apikeys.slice(0, index).concat(apikeys.slice(index + 1)));
    return keys[index];
  },
  clear: function clear() {
    this.__apikeys = null;
    this.__write([]);
    return [];
  },
  list: function list() {
    return this.apikeys;
  },
  edit: function edit() {
    open(this.__path);
  },
  supply: function supply() {
    open('https://tinypng.com/developers');
  },
  __read: function __read() {
    return read(this.__path) || [];
  },
  __write: function __write(apikeys) {
    return write(this.__path, apikeys.filter(function (key) {
      return !key.temporary;
    }));
  }
};


function read(keypath) {
  try {
    var json = _fsExtra2.default.readJsonSync(keypath);
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
  _fsExtra2.default.outputJsonSync(keypath, {
    apikeys: apikeys
  });
}

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