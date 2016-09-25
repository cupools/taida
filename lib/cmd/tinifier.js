'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version(_package2.default.version);

_commander2.default.command('main', null, {
  noHelp: true
}).option('-p, --pattern [globs...]', 'glob pattern for images filepath to compress').option('-d, --dest [path]', 'directory path to save compressed images').option('    --detail [boolean]', 'show more detail').action(function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var options = args.slice(-1)[0];
  var dest = options.dest;
  var detail = options.detail;

  var pattern = getCorrectPattern(options);

  (0, _main2.default)({
    pattern: pattern,
    dest: dest,
    detail: detail
  });
});

_commander2.default.command('key-add [apikey]').description('add an apikey').action(function (apikey) {
  console.log(apikey);
});

_commander2.default.command('*', null, {
  noHelp: true
}).description('output usage information while missing argv').action(function () {
  _commander2.default.outputHelp();
});

_commander2.default.parse(hack(process.argv));

if (!process.argv.slice(2).length) {
  _commander2.default.outputHelp();
}

function getCorrectPattern(options) {
  if (options.pattern) {
    // get correct filepath array
    return options.parent.rawArgs.slice(3).reduce(function (ret, arg) {
      if (arg === '-p' || arg === '--pattern') {
        // mark start
        return ret.concat(null);
      } else if (ret[0] === null && arg[0] === '-') {
        // mark end
        return ret.concat(null);
      } else if (ret[0] === null && arg[0] !== '-') {
        // expected arguments
        if (ret.length === 1 || ret[ret.length - 1] !== null) {
          return ret.concat(arg);
        }
      }
      return ret;
    }, []).filter(function (arg) {
      return !!arg;
    });
  }
  return null;
}

/**
 * Enable `tiny -p *.png` directly
 */
function hack(argv) {
  var ret = _commander2.default.parseOptions(_commander2.default.normalize(argv.slice(2)));
  var a = ret.unknown.length && !ret.args.length ? [].concat(argv.slice(0, 2), 'main', argv.slice(2)) : argv;
  return a;
}