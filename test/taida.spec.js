/* eslint-env mocha */

import { expect } from 'chai'
import fs from 'fs-extra'
import nock from 'nock'

import './common'
import { writeKeys } from './utils'

import taida from '../src/taida'
import apikey from '../src/apikey'

describe('taida', function () {
  this.timeout(1e4)

  const pathProd = apikey.__path
  const pathTest = 'test/tmp/.apikey'

  before(function () {
    apikey.__apikeys = null
    apikey.__path = pathTest
  })

  after(function () {
    apikey.__path = pathProd
  })

  beforeEach(function () {
    apikey.__apikeys = null
    writeKeys({})
  })

  describe('normal', function () {
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

      return taida(buffer).should.be.fulfilled
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

    it('get correct callback', function () {
      apikey.depress('xxx')
      return taida(buffer).should.be.rejectedWith(Error)
    })
  })

  describe('unexpected bitmap', function () {
    let buffer = fs.readFileSync('test/fixtures/bad.png')

    it('get correct callback', function () {
      nock('https://api.tinify.com')
        .post('/shrink')
        .once()
        .reply(415, '{"error":"Unsupported","message":"Oops!"}')

      return taida(buffer).should.be.rejectedWith(Error)
    })
  })

  describe('unauthorized', function () {
    let buffer = fs.readFileSync('test/fixtures/0.png')

    it('should get unauthorized error and fail for no usable apikey', function () {
      nock('https://api.tinify.com')
        .post('/shrink')
        .once()
        .reply(401, '{"error":"Unauthorized","message":"Oops!"}')

      return taida(buffer).should.be.rejectedWith(Error)
        .then(err => {
          expect(err).to.have.property('message')
            .that.to.contain('no usable')
        })
    })

    it('should get unauthorized error and success for second try', function () {
      apikey.delete('xxx')
      apikey.add(['xxx', 'yyy'])

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

      return taida(buffer).should.be.fulfilled
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
