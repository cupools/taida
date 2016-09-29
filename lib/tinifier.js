'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

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
    return compress(buffer).catch(function (ret) {
      return handleError(compress, ret);
    });
  };
};

function setKey() {
  _tinify2.default.key = _apikey2.default.get();
}

function compress(buffer) {
  var _key = _tinify2.default._key;
  return new _promise2.default(function (resolve, reject) {
    return _tinify2.default.fromBuffer(buffer).toBuffer(function (error, data) {
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
    });
  });
}

function handleError(task, ret) {
  var _key = ret._key;
  var payload = (0, _objectWithoutProperties3.default)(ret, ['_key']);

  // error is not for apikey validation

  if (!_key) {
    return _promise2.default.reject(error);
  }

  var error = payload.error;
  var buffer = payload.buffer;
  var message = error.message;


  if (message.includes(401)) {
    // Credentials are invalid (HTTP 401/Unauthorized)
    // should change another apikey and fallback to compress
    _apikey2.default.depress(_key);
    return task(buffer);
  }

  return _promise2.default.reject(error);
}

tinifier.tinify = _tinify2.default;
tinifier.apikey = _apikey2.default;

exports.default = tinifier();