/* eslint-env mocha */

import { expect } from 'chai'
import fs from 'fs-extra'
import nock from 'nock'

import taida from '../src/taida'
import './common'

describe('taida', function () {
  this.timeout(1e4)

  beforeEach(function () {
    nock.cleanAll()
  })

  describe('basic', function () {
    let buffer = fs.readFileSync('test/fixtures/0.png')

    it('should get correct information', function () {
      nock('https://api.tinify.com')
        .post('/shrink')
        .once()
        .reply(201, {}, {
          Location: 'https://api.tinify.com/some/location'
        })

      nock('https://api.tinify.com')
        .get('/some/location')
        .once()
        .reply(200, buffer)

      return taida('apikey', buffer).should.be.fulfilled
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
        })
    })
  })

  describe('unexpected apikey', function () {
    let buffer = new Buffer(10)

    it('be rejected for no usable apikey', function () {
      return taida(null, buffer).should.be.rejectedWith(Error)
        .then(err => {
          expect(err).to.have.property('message')
            .that.to.contain('no usable')
        })
    })
  })

  describe('unexpected bitmap', function () {
    let buffer = fs.readFileSync('test/fixtures/bad.png')

    it('get correct callback', function () {
      nock('https://api.tinify.com')
        .post('/shrink')
        .once()
        .reply(415, '{"error":"Unsupported","message":"Oops!"}')

      return taida('apikey', buffer).should.be.rejectedWith(Error)
    })
  })

  describe('unauthorized', function () {
    let buffer = fs.readFileSync('test/fixtures/0.png')

    it('should get unauthorized error and fail for no usable apikey', function () {
      nock('https://api.tinify.com')
        .post('/shrink')
        .once()
        .reply(401, '{"error":"Unauthorized","message":"Oops!"}')

      return taida('apikey', buffer, taida.bind(null, null, buffer)).should.be.rejectedWith(Error)
        .then(err => {
          expect(err).to.have.property('message')
            .that.to.contain('no usable')
        })
    })

    it('should get unauthorized error and success in second try', function () {
      nock('https://api.tinify.com')
        .post('/shrink')
        .once()
        .reply(401, '{"error":"Unauthorized","message":"Oops!"}')

      nock('https://api.tinify.com')
        .post('/shrink')
        .once()
        .reply(200, {}, {
          Location: 'https://api.tinify.com/some/location'
        })

      nock('https://api.tinify.com')
        .get('/some/location')
        .once()
        .reply(200, buffer)

      return taida('badapikey', buffer, taida.bind(null, 'apikey', buffer)).should.be.fulfilled
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
        })
    })
  })
})
