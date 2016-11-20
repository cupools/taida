'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _includes = require('babel-runtime/core-js/string/includes');

var _includes2 = _interopRequireDefault(_includes);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _tinify = require('tinify');

var _tinify2 = _interopRequireDefault(_tinify);

var _apikey = require('./apikey');

var _apikey2 = _interopRequireDefault(_apikey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var taida = function taida(buffer) {
  var key = _apikey2.default.get();
  var fallback = function fallback() {
    _apikey2.default.depress(key);
    return taida(buffer);
  };

  return compress(key, buffer).then(handleResult(buffer)).catch(handleError(buffer, fallback));
};

function compress(key, buffer) {
  return !key ? _promise2.default.reject(new Error('failed for no usable apikey')) : new _promise2.default(function (resolve, reject) {
    _tinify2.default.key = key;
    _tinify2.default.fromBuffer(buffer).toBuffer(function (error, data) {
      return error ? reject(error) : resolve(data);
    });
  });
}

function handleResult(buffer) {
  return function (data) {
    return _promise2.default.resolve({
      buffer: data,
      size: data.length,
      origin: {
        buffer: buffer,
        size: buffer.length
      },
      level: Number((data.length / buffer.length).toFixed(4))
    });
  };
}

function handleError(buffer, fallback) {
  return function (error) {
    var message = error.message;


    if ((0, _includes2.default)(message, 401)) {
      // Credentials are invalid (HTTP 401/Unauthorized)
      // should change another apikey and fallback to compress
      return fallback();
    }

    return _promise2.default.reject(error);
  };
}

exports.default = taida;