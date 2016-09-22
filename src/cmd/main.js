import glob from 'glob'
import fs from 'fs'

import tinifier from '../tinifier'

export default function (options) {
  let {pattern} = options
  let resources = pattern.splice ? pattern : glob.sync(pattern || '')

  console.log(resources)
  return

  return Promise
    .all(
      resources
        .map(fs.readFileSync.bind(fs))
        .map(tinifier)
    )
    .then(
      datas => datas.map(data => {
        return new Promise((resolve, reject) => {
          fs.writeFile(
            `test/tmp/${Date.now()}.png`,
            data,
            err => (err ? reject(err) : resolve(data))
          )
        })
      })
    )
    .catch(
      console.log.bind(console)
    )
}
