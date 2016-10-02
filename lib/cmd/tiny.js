'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  main: function main(options) {
    (0, _log2.default)(('  Tinifier    version: ' + _package2.default.version).bold);

    var handleError = _ramda2.default.curry(_log2.default.error, _ramda2.default.prop('message'));

    var statistics = _ramda2.default.curry(function (imgs) {
      var success = imgs.filter(function (img) {
        return !img.error;
      });
      var fails = imgs.filter(function (img) {
        return !!img.error;
      });
      var total = success.reduce(function (ret, img) {
        return ret + img.size;
      }, 0);
      var originTotal = success.reduce(function (ret, img) {
        return ret + img.origin.size;
      }, 0);
      var fix = function fix(num) {
        return (num / 1000).toFixed(2);
      };

      _log2.default.statistic('Compress __' + success.length + ' bitmaps__ successful and ' + fails.length + ' fails.');

      if (success.length) {
        _log2.default.statistic('From ' + fix(originTotal) + 'kb to ' + fix(total) + 'kb, saving __' + fix(1e5 - total / originTotal * 1e5) + '%__.');
      }

      if (options.detail) {
        (0, _log2.default)('  Results: ');
        success.forEach(function (img) {
          return _log2.default.info([img.path, fix(img.origin.size) + 'kb -> ' + fix(img.size) + 'kb'].join(': '));
        });
      }

      fails.forEach(function (img) {
        return _log2.default.error([img.path, img.error.message].join(': '));
      });

      return _promise2.default.resolve(imgs);
    });

    var resources = [].concat(options.pattern).map(function (f) {
      return _glob2.default.sync(f);
    }).reduce(function (ret, arr) {
      return ret.concat(arr);
    }, []);

    if (resources.length) {
      _log2.default.info('Found ' + resources.length + ' bitmaps and starting...');
    }

    return (0, _index2.default)(options).then(statistics).catch(handleError);
  }
};