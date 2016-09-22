/* eslint-env mocha */

import {expect} from 'chai'
import fs from 'fs-extra'

import tinifier from '../src/index'

describe('index', function () {
  this.timeout(10e4)

  it('should work', function (done) {
    let buffer = fs.readFileSync('test/fixtures/0.png')

    tinifier(buffer)
      .then(data => {
        done()
      })
      .catch(err => {
        done()
      })
  })
})
