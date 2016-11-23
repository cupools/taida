import fs from 'fs-extra'

const pathTest = 'test/tmp/.apikey'

export function writeKeys(keys) {
  fs.outputJsonSync(pathTest, {
    apikeys: []
      .concat(keys || [])
      .map(
        item => (
        Object.assign({
          valid: true,
          date: Date.now(),
          key: 'xxx'
        }, item)
      )
    )
  })
}

export function readKeys() {
  return fs.readJsonSync(pathTest)
}
