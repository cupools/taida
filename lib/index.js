'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = function (options) {
  if (!(0, _lint2.default)(options)) {
    return _promise2.default.reject(new Error('exit for unexpect options'));
  }

  var pattern = options.pattern;
  var alternate = options.alternate;

  _apikey2.default.alternate = alternate === undefined || !!alternate;

  var resources = [].concat((0, _toConsumableArray3.default)(new _set2.default([].concat(pattern).map(function (f) {
    return _glob2.default.sync(f);
  }).reduce(function (ret, arr) {
    return ret.concat(arr);
  }, []))));

  if (!resources.length) {
    return _promise2.default.reject(new Error('exit for no matched bitmap'));
  }

  var bar = (0, _progress2.default)(resources.length, options.progress);

  var readFile = function readFile(path) {
    return _fsExtra2.default.readFileSync(path);
  };

  var writeFile = function writeFile(path, buffer) {
    return _fsExtra2.default.outputFileSync(path, buffer, {
      encoding: 'binary'
    });
  };

  var wrapImg = function wrapImg(path) {
    return {
      path: path,
      buffer: readFile(path)
    };
  };

  var compressP = function compressP(img) {
    return (0, _taida2.default)(img.buffer).then(function (ret) {
      return _promise2.default.resolve((0, _assign2.default)({}, img, ret));
    }).catch(function (error) {
      return _promise2.default.resolve((0, _extends3.default)({
        error: error
      }, img));
    });
  };

  var outputP = function outputP(dest) {
    return function (img) {
      bar.tick();

      if (img.error) {
        return _promise2.default.resolve(img);
      }

      var path = img.path;
      var buffer = img.buffer;

      var output = dest ? _path2.default.join(dest, _path2.default.basename(path)) : path;

      writeFile(output, buffer);

      return _promise2.default.resolve(img);
    };
  };

  var resourcesP = resources.map(wrapImg).map(compressP).map(function (p) {
    return p.then(outputP(options.dest));
  });

  return _promise2.default.all(resourcesP);
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _apikey = require('./apikey');

var _apikey2 = _interopRequireDefault(_apikey);

var _taida = require('./taida');

var _taida2 = _interopRequireDefault(_taida);

var _lint = require('./lint');

var _lint2 = _interopRequireDefault(_lint);

var _progress = require('./utils/progress');

var _progress2 = _interopRequireDefault(_progress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }