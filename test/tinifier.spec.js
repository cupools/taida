/* eslint-env mocha */

import {expect} from 'chai'
import fs from 'fs-extra'
import nock from 'nock'

import tinifier from '../src/tinifier'
import apikey from '../src/apikey'

describe('tinifier', function () {
  this.timeout(1e4)

  const pathProd = apikey.__path
  const pathTest = 'test/tmp/.apikey'

  before(function () {
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

    it('should get correct information', function (done) {
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
        })
        .then(done)
        .catch(done)
    })
  })

  describe('unexpected bitmap', function () {
    let buffer = fs.readFileSync('test/fixtures/bad.png')

    it('get correct callback', function (done) {
      nock('https://api.tinify.com')
        .post('/shrink')
        .once()
        .reply(415, '{"error":"Unsupported","message":"Oops!"}')

      tinifier(buffer)
        .then(() => done(new Error('should not resolve promise')))
        .catch(err => {
          expect(err).to.have.property('message')
        })
        .then(done)
        .catch(done)
    })
  })

  describe('unauthorized', function () {
    let buffer = fs.readFileSync('test/fixtures/0.png')

    it('should get unauthorized error and fail for no usable apikey', function (done) {
      nock('https://api.tinify.com')
        .post('/shrink')
        .once()
        .reply(401, '{"error":"Unauthorized","message":"Oops!"}')

      tinifier(buffer)
        .then(() => done('should not resolve promise'))
        .catch(err => {
          expect(err).to.have.property('message')
            .that.to.contain('no usable')
        })
        .then(done)
        .catch(done)
    })

    it('should get unauthorized error and success for second try', function (done) {
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
        })
        .then(done)
        .catch(done)
    })
  })

  function writeKeys(keys) {
    if (keys.split) {
      fs.outputFileSync(pathTest, keys)
    } else {
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
  }
})
