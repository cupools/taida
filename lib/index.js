'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = function (options) {
  var pattern = options.pattern;
  var dest = options.dest;


  var resources = pattern.map(function (f) {
    return _glob2.default.sync(f);
  }).reduce(function (ret, arr) {
    return ret.concat(arr);
  }, []);

  var handleError = console.log.bind(console);

  var resourcesP = resources.map(function (f) {
    return {
      path: f,
      buffer: _fsExtra2.default.readFileSync(f)
    };
  }).map(function (img) {
    return (0, _tinifier2.default)(img.buffer).then(function (buffer) {
      return _promise2.default.resolve((0, _extends3.default)({}, img, {
        buffer: buffer
      }));
    });
  }).catch(handleError);

  return _promise2.default.all(resourcesP).then(function (datas) {
    return datas.map(function (img) {
      return new _promise2.default(function (resolve, reject) {
        _fsExtra2.default.outputFileSync(img.path, img.buffer, function (err) {
          return err ? reject(err) : resolve(img);
        });
      });
    });
  }).catch(handleError);
};

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _tinifier = require('./tinifier');

var _tinifier2 = _interopRequireDefault(_tinifier);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }