'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _tinify = require('tinify');

var _tinify2 = _interopRequireDefault(_tinify);

var _apikey = require('./apikey');

var _apikey2 = _interopRequireDefault(_apikey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tinifier = function tinifier() {
  setKey();

  return function (buffer) {
    return compress(buffer).catch(function (error) {
      return handleError(compress, error);
    });
  };
};

function setKey() {
  _tinify2.default.key = _apikey2.default.get();
}

function handleError(task, ret) {
  var error = ret.error;
  var buffer = ret.buffer;
  var message = error.message;


  if (message.includes(401)) {
    // Credentials are invalid (HTTP 401/Unauthorized)
    // should change another apikey and fallback to compress

    return task(buffer);
  }

  return _promise2.default.reject(error);
}

function compress(buffer) {
  return new _promise2.default(function (resolve, reject) {
    return _tinify2.default.fromBuffer(buffer).toBuffer(function (error, data) {
      if (error) {
        reject({
          error: error,
          buffer: buffer
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
    });
  });
}

tinifier.tinify = _tinify2.default;
tinifier.apikey = _apikey2.default;

exports.default = tinifier();