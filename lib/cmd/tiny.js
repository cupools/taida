'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version(_package2.default.version).usage('[command] [options]');

_commander2.default.command('compress', 'compression', {
  noHelp: true,
  isDefault: true
}).option('-p, --pattern [globs...]', 'glob pattern for images filepath to compress').option('-d, --dest [path]', 'directory path to save compressed images').option('    --detail [boolean]', 'show more detail');

_commander2.default.command('apikey').description('apikey').option('-a --add <apikeys...>').option('-d --del <apikeys...>').option('   --list').option('   --edit').option('   --clear');

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