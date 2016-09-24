/* eslint-env mocha */

import {expect} from 'chai'
import fs from 'fs-extra'

import tinifier from '../src/index'

describe('index', function () {
  this.timeout(10e4)
  this.beforeEach(function () {
    fs.copySync('test/fixtures', 'test/tmp')
  })

  it('should work', function (done) {
    let option = {
      pattern: 'test/tmp/{1,2,3,bad}.png'
    }

    tinifier(option)
      .then(data => {
        done()
      })
      .catch(err => {
        done()
      })
  })
})
