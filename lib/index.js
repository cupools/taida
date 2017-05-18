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

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = function (opt) {
  var options = null;

  try {
    options = (0, _checkin2.default)(opt, _lint.lint);
  } catch (e) {
    return _promise2.default.reject(e);
  }

  var _options = options;
  var pattern = _options.pattern;
  var alternate = _options.alternate;
  var apikeys = _options.apikeys;
  var dest = _options.dest;

  _apikey2.default.config({ alternate: alternate, apikeys: apikeys });

  var isBitmap = function isBitmap(p) {
    return (/\.(jpg|jpeg|png)$/.test(p)
    );
  };
  var resources = (0, _from2.default)(new _set2.default([].concat(pattern).map(function (f) {
    return _glob2.default.sync(f);
  }).reduce(function (ret, arr) {
    return ret.concat(arr);
  }, []).filter(isBitmap)));

  if (!resources.length) {
    return _promise2.default.reject(new Error('exit for no matched bitmaps'));
  }

  if (options.progress) _emitter2.default.emit('bar.init', resources.length);

  var readFile = function readFile(path) {
    return _fsExtra2.default.readFileSync(path);
  };
  var writeFile = function writeFile(path, buffer) {
    return _fsExtra2.default.outputFileSync(path, buffer, { encoding: 'binary' });
  };
  var wrapImg = function wrapImg(path) {
    return {
      path: path,
      buffer: readFile(path)
    };
  };

  var compressP = function compressP(img) {
    var key = _apikey2.default.get();
    var buffer = img.buffer;
    var fallback = function fallback() {
      _apikey2.default.depress(key);
      return (0, _taida2.default)(_apikey2.default.get(), buffer, fallback);
    };

    return (0, _taida2.default)(key, buffer, fallback).then(function (ret) {
      return _promise2.default.resolve((0, _assign2.default)({}, img, ret));
    }).catch(function (error) {
      return _promise2.default.resolve((0, _extends3.default)({}, img, {
        error: error
      }));
    });
  };

  var outputP = function outputP(outputDir, img) {
    _emitter2.default.emit('bar.progress');

    if (img.error) {
      return _promise2.default.resolve(img);
    }

    var path = img.path;
    var buffer = img.buffer;

    var output = outputDir ? _path2.default.join(outputDir, _path2.default.basename(path)) : path;
    writeFile(output, buffer);

    return _promise2.default.resolve(img);
  };

  var resourcesP = resources.map(wrapImg).map(function (img) {
    return compressP(img).then(outputP.bind(null, dest));
  });

  return _promise2.default.all(resourcesP);
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _checkin = require('checkin');

var _checkin2 = _interopRequireDefault(_checkin);

require('./utils/progress');

var _apikey = require('./apikey');

var _apikey2 = _interopRequireDefault(_apikey);

var _taida = require('./taida');

var _taida2 = _interopRequireDefault(_taida);

var _lint = require('./lint');

var _emitter = require('./utils/emitter');

var _emitter2 = _interopRequireDefault(_emitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }