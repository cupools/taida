'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DB_PATH = _path2.default.resolve('.apikey');

exports.default = {
  add: function add() {},
  get: function get() {
    var option = {
      encoding: 'utf8'
    };

    try {
      return _fs2.default.readFileSync(DB_PATH, option);
    } catch (e) {
      _fs2.default.writeFileSync(DB_PATH, '', option);

      return null;
    }
  },
  clear: function clear() {}
};