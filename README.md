## Tinifier

Compress images by [https://tinypng.com](https://tinypng.com)

## TODO

- [x] Basic function
- [x] Basic CLI
- [x] Apikeys validation and auto switch within presets
- [x] Backup and restore compressed bitmaps
- [ ] Advanced information reporters
- [ ] Test coverage
- [ ] Documentation
- [ ] Publish npm

## Getting started
### CLI

```bash
$ tiny --help
  Usage: tiny [options] [files ...]


  Commands:

    restore   restore the latest compressed bitmaps

  Options:

    -h, --help          output usage information
    -V, --version       output the version number
    -d, --dest <path>   directory path to output images
        --detail        show more detail
        --no-alternate  only use the first apikey even though invalid
        --no-backup     do not backup latest compressed bitmaps for restore

  Examples:

    $ tiny images/banner.png
    $ tiny **/*.{png,jpg} --dest ./compress
    $ tiny-apikey add apikeyfromtinypng
```

```bash
$ tiny-apikey --help

  Usage: tiny-apikey <command> [key]


  Commands:

    add <keys ...>     add apikeys for usage
    delete <key>  remove apikey
    use <key>     suggest specified key to be used first
    list          show apikeys list and compress count
    edit          open .apikeys in editor
    supply        open http://tinypng.com to supply api key
    clear         remove all apikeys

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

## Test

```bash
npm i && npm test
```

## License
Copyright (c) 2016 cupools

Licensed under the MIT license.
