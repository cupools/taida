'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = function (options) {
  var pattern = options.pattern;

  var resources = pattern.splice ? pattern : _glob2.default.sync(pattern || '');

  console.log(resources);
  return;

  return _promise2.default.all(resources.map(_fs2.default.readFileSync.bind(_fs2.default)).map(_tinifier2.default)).then(function (datas) {
    return datas.map(function (data) {
      return new _promise2.default(function (resolve, reject) {
        _fs2.default.writeFile('test/tmp/' + Date.now() + '.png', data, function (err) {
          return err ? reject(err) : resolve(data);
        });
      });
    });
  }).catch(console.log.bind(console));
};

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _tinifier = require('../tinifier');

var _tinifier2 = _interopRequireDefault(_tinifier);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }