## tinifier

Compress images by [https://tinypng.com](https://tinypng.com)

## TODO

- [x] Basic function
- [x] Basic CLI
- [ ] Apikeys validation and auto switch within presets
- [ ] Backup and restore compressed bitmaps
- [ ] Advanced progress bar and reporters
- [ ] More

## Getting started

```bash
$ tiny --help
  Usage: tinifier [options]

  Options:

    -h, --help                output usage information
    -V, --version             output the version number
    -p, --pattern [globs...]  glob pattern for images filepath to compress
    -d, --dest [path]         directory path to save compressed images
        --detail [boolean]    show more detail
```

```bash
$ tiny -p images/*.png
```

## Test

```bash
npm i && npm test
```

## License
Copyright (c) 2016 cupools

Licensed under the MIT license.
