/* eslint-env mocha */

import { expect } from 'chai'
import fs from 'fs-extra'
import nock from 'nock'

import { writeKeys } from './utils'
import taida from '../src/index'
import apikey from '../src/apikey'

describe('index', function () {
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
      alternate: true
    }

    taida(option)
      .then(() => {
        done()
      })
      .catch(err => {
        done(err)
      })
  })

  it('should exit with unexpected option', function (done) {
    taida({})
      .then(() => {
        done(new Error('unexpected option'))
      })
      .catch(() => {
        done()
      })
  })

  it('should exit with empty bitmaps', function (done) {
    let option = {
      pattern: 'undefined.png'
    }

    taida(option)
      .then(() => {
        done(new Error('unexpected option'))
      })
      .catch(() => {
        done()
      })
  })

  it('should work with specified dest', function (done) {
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
      alternate: true,
      dest: 'test/tmp/dest'
    }

    taida(option)
      .then(() => {
        expect(fs.readFileSync('test/tmp/dest/1.png')).to.not.be.null
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
