import glob from 'glob'
import fs from 'fs'

import tinifier from '../tinifier'

export default function (options) {
  let {pattern} = options
  let resources = pattern
    .map(f => glob.sync(f))
    .reduce(
      (ret, arr) => ret.concat(arr),
      []
    )

  return Promise
    .all(
      resources
        .map(f => fs.readFileSync(f))
        .map(tinifier)
    )
    .then(
      datas => datas.map(data => {
        return new Promise((resolve, reject) => {
          fs.writeFile(
            `test/tmp/${Date.now() + Math.random()}.png`,
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
