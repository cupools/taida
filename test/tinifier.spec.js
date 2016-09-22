/* eslint-env mocha */

import {expect} from 'chai'
import fs from 'fs-extra'

import tinifier from '../src/tinifier'

describe('tinifier', function () {
  this.timeout(10e4)

  describe('should work', function () {
    let buffer = fs.readFileSync('test/fixtures/0.png')

    it('should not throw exception', function (done) {
      tinifier(buffer)
        .then(data => {
          expect(data).to.have.property('buffer')
          expect(data).to.have.property('size')
            .that.is.a('number')
          expect(data).to.have.property('level')
            .that.is.a('number')
            .that.to.be.within(0, 1)

          done()
        })
        .catch(err => {
          console.log(err)
          done()
        })
    })
  })
})
