import program from 'commander'
import PKG from '../../package.json'
import main from './main'

program
  .version(PKG.version)
  .usage('[command] [options]')

program
  .command('compress', 'compression', {
    noHelp: true,
    isDefault: true
  })
  .option('-p, --pattern [globs...]', 'glob pattern for images filepath to compress')
  .option('-d, --dest [path]', 'directory path to save compressed images')
  .option('    --detail [boolean]', 'show more detail')

program
  .command('apikey')
  .description('apikey')
  .option('-a --add [apikeys...]')
  .option('-d --del [apikeys...]')
  .option('   --list')
  .option('   --edit')
  .option('   --clear')

program
  .command('*', null, {
    noHelp: true
  })
  .description('output usage information while missing argv')
  .action(function () {
    program.outputHelp()
  })


program.parse(hack(process.argv))

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

function getCorrectPattern(options) {
  if (options.pattern) {
    // get correct filepath array
    return options.parent.rawArgs
      .slice(3)
      .reduce(
        (ret, arg) => {
          if (arg === '-p' || arg === '--pattern') {
            // mark start
            return ret.concat(null)
          } else if (ret[0] === null && arg[0] === '-') {
            // mark end
            return ret.concat(null)
          } else if (ret[0] === null && arg[0] !== '-') {
            // expected arguments
            if (ret.length === 1 || ret[ret.length - 1] !== null) {
              return ret.concat(arg)
            }
          }
          return ret
        },
        []
      )
      .filter(arg => !!arg)
  }
  return null
}
