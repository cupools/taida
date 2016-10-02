'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var state = true;

var log = function log() {
  var _console;

  /* istanbul ignore next */
  process.env.NODE_ENV !== 'test' && state && (_console = console).log.apply(_console, arguments);
};

log.info = function (msg) {
  log('  ' + msg);
};

log.warn = function (msg) {
  log('  warn: ' + _colors2.default.yellow(msg));
};

log.error = function (msg) {
  log('  error: ' + _colors2.default.red(msg));
};

log.build = function (path) {
  log.info('compressed ' + path);
};

log.statistic = function (msg) {
  log.info(msg.replace(/__([^_]+?)__/g, function (match, $1) {
    return _colors2.default.green($1);
  }));
};

log.state = function (quiet) {
  state = !quiet;
};

exports.default = log;