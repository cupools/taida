/* eslint-env mocha */

import { expect } from 'chai'
import fs from 'fs-extra'
import nock from 'nock'

import { writeKeys } from './utils'
import apikey from '../src/apikey'
import tiny from '../src/cmd/tiny'

describe('cmd/tiny', function () {
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

  this.beforeEach(function () {
    fs.copySync('test/fixtures', 'test/tmp')
  })

  describe('.main', function () {
    it('should work', function (done) {
      writeKeys({
        key: 'xxx'
      })

      nock('https://api.tinify.com')
        .post('/shrink')
        .twice()
        .reply(201, {}, {
          Location: 'https://api.tinify.com/some/location'
        })

      nock('https://api.tinify.com')
        .post('/shrink')
        .once()
        .reply(415, '{"error":"bad","message":"Oops!"}')

      nock('https://api.tinify.com')
        .get('/some/location')
        .thrice()
        .reply(200, new Buffer(10))

      let option = {
        pattern: 'test/tmp/{1,2,bad}.png',
        detail: true,
        backup: false
      }

      tiny
        .main(option)
        .then(() => {
          done()
        })
        .catch(err => {
          done(err)
        })
    })

    it('should exit for no matched bitmaps', function (done) {
      let option = {
        pattern: 'test/tmp/undefined'
      }

      tiny
        .main(option)
        .then(() => {
          done()
        })
        .catch(err => {
          done(err)
        })
    })

    it('should pass progress for no success bitmaps', function (done) {
      nock('https://api.tinify.com')
        .post('/shrink')
        .once()
        .reply(415, '{"error":"bad","message":"Oops!"}')

      let option = {
        pattern: 'test/tmp/bad.png',
        backup: true
      }

      tiny
        .main(option)
        .then(() => {
          done()
        })
        .catch(err => {
          done(err)
        })
    })
  })

  describe('.restore', function () {
    it('should work', function (done) {
      writeKeys({
        key: 'xxx'
      })

      nock('https://api.tinify.com')
        .post('/shrink')
        .once()
        .reply(201, {}, {
          Location: 'https://api.tinify.com/some/location'
        })

      nock('https://api.tinify.com')
        .get('/some/location')
        .once()
        .reply(200, new Buffer(10))

      let option = {
        pattern: 'test/tmp/1.png',
        backup: true
      }

      tiny
        .main(option)
        .then((img) => {
          let {size, origin} = img[0]
          let originSize = origin.size

          tiny.restore()

          let buffer = fs.readFileSync('test/tmp/1.png')

          expect(buffer.length).to.be.equal(originSize)
          expect(buffer.length).to.not.be.equal(size)
          done()
        })
        .catch(err => {
          done(err)
        })
    })

    it('should pass progress for no success bitmaps', function (done) {
      nock('https://api.tinify.com')
        .post('/shrink')
        .once()
        .reply(415, '{"error":"bad","message":"Oops!"}')

      let option = {
        pattern: 'test/tmp/bad.png',
        backup: true
      }

      tiny
        .main(option)
        .then(() => {
          expect(fs.readFileSync.bind(fs, '.backup/test/tmp/bad.png')).to.throw(Error)
          tiny.restore()
          done()
        })
        .catch(err => {
          done(err)
        })
    })
  })
})
