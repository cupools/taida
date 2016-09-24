'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = function (options) {
  var pattern = options.pattern;

  var resources = [].concat(pattern).map(function (f) {
    return _glob2.default.sync(f);
  }).reduce(function (ret, arr) {
    return ret.concat(arr);
  }, []);

  _log2.default.info('Found ' + resources.length + ' bitmaps and starting...');

  var bar = (0, _progress2.default)(resources.length);

  // handleError :: String -> ()
  var handleError = _ramda2.default.curry(_log2.default.error, _ramda2.default.prop('message'));

  // readFile :: String -> String
  var readFile = function readFile(path) {
    return _fsExtra2.default.readFileSync(path);
  };

  // writeFile :: String -> ()
  var writeFile = function writeFile(path, buffer) {
    return _fsExtra2.default.outputFileSync(path, buffer, {
      encoding: 'binary'
    });
  };

  // wrapImg :: String -> img
  var wrapImg = function wrapImg(path) {
    return {
      path: path,
      buffer: readFile(path)
    };
  };

  // compressP :: img -> Promise img
  var compressP = function compressP(img) {
    return (0, _tinifier2.default)(img.buffer).then(function (ret) {
      return _promise2.default.resolve((0, _assign2.default)({}, img, ret));
    }).catch(function (error) {
      return _promise2.default.resolve((0, _extends3.default)({
        error: error
      }, img));
    });
  };

  // outputP :: String -> (img -> Promise img)
  var outputP = _ramda2.default.curry(function (dest, img) {
    bar.tick();

    if (img.error) {
      return _promise2.default.resolve(img);
    }

    var path = img.path;
    var buffer = img.buffer;

    var output = dest ? _path2.default.join(dest, _path2.default.basename(path)) : path;

    writeFile(output, buffer);

    return _promise2.default.resolve(img);
  });

  var resourcesP = resources.map(wrapImg).map(compressP).map(function (p) {
    return p.then(outputP(options.dest));
  }).map(function (p) {
    return p.catch(handleError);
  });

  return _promise2.default.all(resourcesP);
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _tinifier = require('./tinifier');

var _tinifier2 = _interopRequireDefault(_tinifier);

var _log = require('./utils/log');

var _log2 = _interopRequireDefault(_log);

var _progress = require('./utils/progress');

var _progress2 = _interopRequireDefault(_progress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }