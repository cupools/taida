'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version(_package2.default.version).command('compress', 'compress bitaps', {
  isDetault: true,
  noHelp: true
}).option('-p, --pattern [globs...]', 'glob pattern for images filepath to compress').option('-d, --dest [path]', 'directory path to save compressed images').option('    --detail [boolean]', 'show more detail').parse(process.argv);

if (_commander2.default.pattern) {
  // get correct filepath array
  var pattern = _commander2.default.rawArgs.slice(2).reduce(function (ret, arg) {
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

  var dest = _commander2.default.dest;
  var detail = _commander2.default.detail;

  (0, _main2.default)({
    pattern: pattern,
    dest: dest,
    detail: detail
  });
}