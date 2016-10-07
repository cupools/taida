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

    _log2.default.info('\n  __taida    version: ' + _package2.default.version + '__\n');

    if (resources.length) {
      _log2.default.info('Found ' + resources.length + ' bitmaps and starting...');
    }

    return (0, _index2.default)(options).then(function (imgs) {
      return backup(imgs, options.backup);
    }).then(function (imgs) {
      return statistics(imgs, options.detail);
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
        _log2.default.info('%s has been restore', path);
      });
    } else {
      _log2.default.info('No usable backup now');
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

  _log2.default.info('Compress ___' + success.length + ' bitmaps___ successful and ' + fails.length + ' fails.');

  if (success.length) {
    _log2.default.info('From ' + fix(originTotal) + 'kb to ' + fix(total) + 'kb, saving ___' + fix(1e5 - total / originTotal * 1e5) + '%___.');
  }

  if (detail) {
    _log2.default.info('Results: ');
    success.forEach(function (img) {
      return _log2.default.info('___√___ %s %skb -> %skb', img.path, fix(img.origin.size), fix(img.size));
    });
  }

  fails.forEach(function (img) {
    return _log2.default.error('× %s %s', img.path, img.error.message);
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

    _log2.default.info('Backup %s bitmaps successful and restore by: _$ taida restore_', success.length);
  }

  return _promise2.default.resolve(imgs);
}

function handleError(error) {
  _log2.default.error(error.message);
}