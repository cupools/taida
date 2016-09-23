/* eslint-env mocha */

import {expect} from 'chai'
import fs from 'fs-extra'

import tinifier from '../src/tinifier'

describe('tinifier', function () {
  this.timeout(10e4)

  describe('should work', function () {
    let buffer = fs.readFileSync('test/fixtures/0.png')

    it('get correct information', function (done) {
      tinifier(buffer)
        .then(data => {
          expect(data).to.have.property('buffer')
            .that.to.be.an.instanceof(Buffer)
          expect(data).to.have.property('size')
            .that.is.a('number')
          expect(data).to.have.deep.property('origin.buffer')
            .that.to.be.an.instanceof(Buffer)
          expect(data).to.have.deep.property('origin.size')
            .that.is.a('number')
          expect(data).to.have.property('level')
            .that.is.a('number')
            .that.to.be.within(0, 1)
          done()
        })
        .catch(err => {
          done(err)
        })
    })
  })

  describe('should catch error with unexpected bitmap', function () {
    let buffer = fs.readFileSync('test/fixtures/bad.png')

    it('get correct callback', function (done) {
      tinifier(buffer)
        .then(() => {
          done(new Error('should not resolve promise'))
        })
        .catch(err => {
          expect(err).to.have.property('message')
            .that.to.contain('HTTP 415/Unsupported file type')
          done()
        })
    })
  })
})
