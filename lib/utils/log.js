'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = function log() {
  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'testing' && log.active) {
    var _console;

    // eslint-disable-next-line no-console
    (_console = console).log.apply(_console, arguments);
  }
};

log.active = true;

log.info = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  log.apply(undefined, ['  ' + render(args[0])].concat((0, _toConsumableArray3.default)(args.slice(1))));
};

log.warn = function () {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  log.info.apply(log, [_colors2.default.yellow('warn: ' + args[0])].concat((0, _toConsumableArray3.default)(args.slice(1))));
};

log.error = function () {
  for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  log.info.apply(log, [_colors2.default.red('error: ' + args[0])].concat((0, _toConsumableArray3.default)(args.slice(1))));
};

function render(str) {
  return !str.includes('_') ? str : str.replace(/___([\w\W]+?)___/, function (_, p1) {
    return p1.green;
  }).replace(/__([\w\W]+?)__/, function (_, p1) {
    return p1.bold;
  }).replace(/_([\w\W]+?)_/, function (_, p1) {
    return p1.italic;
  });
}

exports.default = log;