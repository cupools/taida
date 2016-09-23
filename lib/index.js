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

  // handleError :: String -> ()
  var handleError = _ramda2.default.curry(_log2.default.error, _ramda2.default.prop('message'));

  // readFile :: String -> String
  var readFile = function readFile(path) {
    return _fsExtra2.default.readFileSync(path);
  };

  // readFile :: String -> ()
  var writeFile = function writeFile(path, buffer) {
    return _fsExtra2.default.outputFileSync(path, buffer, {
      encoding: 'binary'
    });
  };

  var imgP = function imgP(img) {
    return (0, _tinifier2.default)(img.buffer).then(function (ret) {
      return _promise2.default.resolve((0, _assign2.default)({}, img, ret));
    }).catch(function (error) {
      return _promise2.default.reject((0, _extends3.default)({
        error: error
      }, img));
    });
  };

  // outputP :: String -> img -> Promise img
  var outputP = _ramda2.default.curry(function (dest, img) {
    if (img.error) {
      return _promise2.default.resolve(img);
    }

    var path = img.path;
    var buffer = img.buffer;

    var output = dest ? _path2.default.join(dest, _path2.default.basename(path)) : path;

    writeFile(output, buffer);

    return _promise2.default.resolve(img);
  });

  var resourcesP = resources.map(function (f) {
    return {
      path: f,
      buffer: readFile(f)
    };
  }).map(imgP).map(function (p) {
    return p.then(outputP(options.dest));
  }).map(function (p) {
    return p.catch(handleError);
  });

  var statistics = _ramda2.default.curry(function (imgs) {
    var success = imgs.filter(function (img) {
      return !img.error;
    });
    var fails = imgs.filter(function (img) {
      return !!img.error;
    });
    var total = imgs.reduce(function (ret, img) {
      return ret + img.size;
    }, 0);
    var originTotal = imgs.reduce(function (ret, img) {
      return ret + img.origin.size;
    }, 0);
    var fix = function fix(num) {
      return (num / 1000).toFixed(2);
    };

    _log2.default.statistic('Compress __' + success.length + ' bitmaps__ successful and __' + fails.length + '__ fails.');
    _log2.default.statistic('From ' + fix(originTotal) + 'kb to ' + fix(total) + 'kb, saving __' + fix(1e5 - total / originTotal * 1e5) + '%__.');
  });

  return _promise2.default.all(resourcesP).then(statistics).catch(handleError);
};

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _tinifier = require('./tinifier');

var _tinifier2 = _interopRequireDefault(_tinifier);

var _log = require('./utils/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }