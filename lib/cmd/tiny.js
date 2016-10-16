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
var BACKUP_FILE = _path2.default.join(BACKUP_PATH, 'db.json');

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
    return _restore();
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
    _log2.default.info('From ' + fix(originTotal) + 'kb to ' + fix(total) + 'kb, saving ___' + fix(1e5 - total / originTotal * 1e5) + '%___.\n');
  }

  if (detail) {
    _log2.default.info('Results: ');
    success.forEach(function (img) {
      return _log2.default.info('___√___ %s: %skb -> %skb', img.path, fix(img.origin.size), fix(img.size));
    });
  }

  fails.forEach(function (img) {
    return _log2.default.info('× %s: %s'.red, img.path, img.error.message);
  });

  return _promise2.default.resolve(imgs);
}

function _restore() {
  if (!_fsExtra2.default.existsSync(BACKUP_FILE)) {
    _log2.default.warn('No usable backup now');
    return;
  }

  var db = _fsExtra2.default.readJSONSync(BACKUP_FILE);
  db.forEach(function (item) {
    var path = item.path;
    var backup = item.backup;

    _fsExtra2.default.copySync(backup, path);
    _log2.default.info('%s has been restore', path);
  });
}

function backup(imgs, isBackup) {
  _fsExtra2.default.emptyDirSync(BACKUP_PATH); // clear dir to avoid unexpect restore

  if (!isBackup) {
    return _promise2.default.resolve(imgs);
  }

  var success = imgs.filter(function (img) {
    return !img.error;
  });
  var db = success.reduce(function (ret, img, index) {
    var path = img.path;
    var origin = img.origin;

    var basename = index + _path2.default.basename(path);
    var output = _path2.default.resolve(BACKUP_PATH, basename);
    var option = { encoding: 'binary' };

    _fsExtra2.default.outputFileSync(output, origin.buffer, option);

    return ret.concat({
      path: _path2.default.resolve(path),
      backup: output
    });
  }, []);
  _fsExtra2.default.outputJSONSync(BACKUP_FILE, db);
  return _promise2.default.resolve(imgs);
}

function handleError(error) {
  _log2.default.error(error.message);
}