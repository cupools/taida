'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _includes = require('babel-runtime/core-js/array/includes');

var _includes2 = _interopRequireDefault(_includes);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _proof = require('proof');

var _proof2 = _interopRequireDefault(_proof);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _lodash = require('lodash.merge');

var _lodash2 = _interopRequireDefault(_lodash);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _lint = require('./lint');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * API to control apikey
 */
exports.default = {
  __apikeys: [],
  __alternate: true,
  __eventEmitter: new _events2.default(),
  get apikeys() {
    return this.__apikeys;
  },
  set apikeys(apikeys) {
    return this.config({ apikeys: apikeys, alternate: this.alternate }).__apikeys;
  },
  get alternate() {
    return this.__alternate;
  },
  set alternate(alternate) {
    return this.config({ alternate: alternate }).__alternate;
  },
  config: function config(opt) {
    var _apikeys;

    var options = (0, _proof2.default)(opt, (0, _lodash2.default)(_lint.apikeyLint, {
      apikeys: { def: this.apikeys },
      alternate: { def: this.alternate }
    }));

    var apikeys = options.apikeys;
    var alternate = options.alternate;

    var now = Date.now();

    var newVal = apikeys.map(function (item) {
      if (typeof item === 'string') {
        return {
          key: item,
          valid: true,
          date: now
        };
      } else if (!item.valid && now - item.date > 1 * 24 * 3600 * 1e3) {
        return {
          key: item.key,
          valid: true,
          date: now
        };
      }
      return {
        key: item.key,
        valid: item.valid,
        date: item.date
      };
    });

    this.clear();
    this.__alternate = alternate;
    (_apikeys = this.__apikeys).push.apply(_apikeys, (0, _toConsumableArray3.default)(newVal));
    this.__eventEmitter.emit('config', this.__apikeys);
    return this;
  },
  get: function get() {
    var apikeys = this.apikeys;
    var alternate = this.alternate;

    if (alternate) {
      var valids = apikeys.filter(function (item) {
        return item.valid;
      });
      return valids.length ? valids[0].key : null;
    }

    return apikeys[0] && apikeys[0].valid ? apikeys[0].key : null;
  },
  depress: function depress(key) {
    var apikeys = this.apikeys;

    var index = apikeys.map(function (item) {
      return item.key;
    }).indexOf(key);
    var item = apikeys[index];

    if (!item) {
      return false;
    } else if (item.valid) {
      item.valid = false;
      item.date = Date.now();
      this.__eventEmitter.emit('depress', key, this.__apikeys);
    }

    return key;
  },
  add: function add(args) {
    var apikeys = this.apikeys;

    var keys = apikeys.map(function (item) {
      return item.key;
    });
    var success = [].concat(args).reduce(function (ret, key) {
      return (0, _includes2.default)(keys, key) ? ret : ret.concat(key);
    }, []);

    if (!success.length) {
      return false;
    }

    this.config({ apikeys: apikeys.concat(success) });
    return success;
  },
  remove: function remove(args) {
    var apikeys = this.apikeys;

    var keys = apikeys.map(function (item) {
      return item.key;
    });
    var success = [].concat(args).reduce(function (ret, key) {
      return (0, _includes2.default)(keys, key) ? ret.concat(key) : ret;
    }, []);

    if (!success.length) {
      return false;
    }

    this.config({ apikeys: apikeys.filter(function (item) {
        return !(0, _includes2.default)(success, item.key);
      }) });
    return success;
  },
  clear: function clear() {
    this.__apikeys.splice(0, this.__apikeys.length);
    return this.__apikeys;
  },
  list: function list() {
    return this.apikeys;
  },
  fromArray: function fromArray(apikeys) {
    return this.config({ apikeys: apikeys });
  },
  fromJSONFile: function fromJSONFile(filepath) {
    var key = arguments.length <= 1 || arguments[1] === undefined ? 'apikeys' : arguments[1];

    var json = _fsExtra2.default.readJSONSync(filepath);
    return this.fromArray(json[key]);
  }
};