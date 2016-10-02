'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _tinify = require('tinify');

var _tinify2 = _interopRequireDefault(_tinify);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _apikey = require('./apikey');

var _apikey2 = _interopRequireDefault(_apikey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tinifier = function tinifier(buffer) {
  return compress(buffer).catch(_ramda2.default.curry(handleError)(compress));
};

function compress(buffer) {
  var _key = _tinify2.default.key = _apikey2.default.get();

  if (!_key) {
    return _promise2.default.reject(new Error('failed for no usable apikey'));
  }

  return new _promise2.default(function (resolve, reject) {
    return _tinify2.default.fromBuffer(buffer).toBuffer(_ramda2.default.curry(handleResult)(resolve, reject, buffer, _key));
  });
}

function handleResult(resolve, reject, buffer, _key, error, data) {
  if (error) {
    reject({
      error: error,
      buffer: buffer,
      _key: _key
    });
  } else {
    resolve({
      buffer: data,
      size: data.length,
      origin: {
        buffer: buffer,
        size: buffer.length
      },
      level: Number((data.length / buffer.length).toFixed(4))
    });
  }
}

function handleError(fallback, ret) {
  // unexpect error
  if (ret instanceof Error) {
    return _promise2.default.reject(ret);
  }

  var _key = ret._key;
  var error = ret.error;
  var buffer = ret.buffer;
  var message = error.message;


  if (message.includes(401)) {
    // Credentials are invalid (HTTP 401/Unauthorized)
    // should change another apikey and fallback to compress
    _apikey2.default.depress(_key);
    return fallback(buffer);
  }

  return _promise2.default.reject(error);
}

tinifier.tinify = _tinify2.default;
tinifier.apikey = _apikey2.default;

exports.default = tinifier;