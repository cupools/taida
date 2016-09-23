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
  var dest = options.dest;


  var resources = [].concat(pattern).map(function (f) {
    return _glob2.default.sync(f);
  }).reduce(function (ret, arr) {
    return ret.concat(arr);
  }, []);

  var handleError = console.log.bind(console);
  var imgP = function imgP(img) {
    return (0, _tinifier2.default)(img.buffer).then(function (ret) {
      return _promise2.default.resolve((0, _assign2.default)({}, img, ret));
    }).catch(function (error) {
      return _promise2.default.reject((0, _extends3.default)({
        error: error
      }, img));
    });
  };

  var outputP = function outputP(img) {
    var path = img.path;
    var buffer = img.buffer;
    var size = img.size;
    var origin = img.origin;
    var level = img.level;

    _fsExtra2.default.writeFileSync(path, buffer, {
      encoding: 'binary'
    });

    _log2.default.build(path, level);
  };

  var resourcesP = resources.map(function (f) {
    return {
      path: f,
      buffer: _fsExtra2.default.readFileSync(f)
    };
  }).map(imgP).map(function (p) {
    return p.then(outputP);
  }).map(function (p) {
    return p.catch(handleError);
  });

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

var _log = require('./utils/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }