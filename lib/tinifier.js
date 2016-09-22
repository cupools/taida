'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _tinify = require('tinify');

var _tinify2 = _interopRequireDefault(_tinify);

var _apikey = require('./extend/apikey');

var _apikey2 = _interopRequireDefault(_apikey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tinifier = function tinifier(buffer) {
  _tinify2.default.key = _apikey2.default.get();

  return new _promise2.default(function (resolve, reject) {
    return _tinify2.default.fromBuffer(buffer).toBuffer(function (error, data) {
      return error ? reject(error) : resolve({
        buffer: data,
        size: data.length,
        origin: {
          buffer: buffer,
          size: buffer.length
        },
        level: Number((data.length / buffer.length).toFixed(4))
      });
    });
  });
};

tinifier.apikey = _apikey2.default;

exports.default = tinifier;