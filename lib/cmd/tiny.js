'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BACKUP_PATH = _path2.default.join(__dirname, '../..', '.backup');

exports.default = {
  main: function main(options) {
    var resources = [].concat(options.pattern).map(function (f) {
      return _glob2.default.sync(f);
    }).reduce(function (ret, arr) {
      return ret.concat(arr);
    }, []);

    (0, _log2.default)(('  Tinifier    version: ' + _package2.default.version).bold);

    if (resources.length) {
      _log2.default.info('Found ' + resources.length + ' bitmaps and starting...');
    }

    return (0, _index2.default)(options).then(function (imgs) {
      return statistics(imgs, options.detail);
    }).then(function (imgs) {
      return backup(imgs, options.backup);
    }).catch(handleError);
  },
  restore: function restore() {
    var items = _glob2.default.sync('**/*.*', {
      cwd: BACKUP_PATH
    });

    if (items.length) {
      items.forEach(function (path) {
        var realpath = _path2.default.join(BACKUP_PATH, path);
        _fsExtra2.default.copySync(realpath, path);
        (0, _log2.default)('  %s has been restore', path);
      });
    } else {
      (0, _log2.default)('  No usable backup now');
    }
  }
};


function statistics(imgs, detail) {
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
  if (detail) {
    (0, _log2.default)('  Results: ');
    success.forEach(function (img) {
      return _log2.default.info([img.path, fix(img.origin.size) + 'kb -> ' + fix(img.size) + 'kb'].join(': '));
    });
  }

  fails.forEach(function (img) {
    return _log2.default.error([img.path, img.error.message].join(': '));
  });

  return _promise2.default.resolve(imgs);
}

function backup(imgs, isBackup) {
  if (!isBackup) {
    return _promise2.default.resolve(imgs);
  }

  var success = imgs.filter(function (img) {
    return !img.error;
  });
  if (success.length) {
    _fsExtra2.default.emptyDirSync(BACKUP_PATH);

    success.forEach(function (img) {
      var path = img.path;
      var origin = img.origin;

      _fsExtra2.default.outputFileSync(_path2.default.resolve(BACKUP_PATH, path), origin.buffer, {
        encoding: 'binary'
      });
    });

    (0, _log2.default)('  Backup %s bitmaps successful and restore by: $ tiny restore', success.length);
  }

  return _promise2.default.resolve(imgs);
}

function handleError(error) {
  _log2.default.error(error.message);
}