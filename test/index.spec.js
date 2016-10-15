/* eslint-env mocha */

import { expect } from 'chai'
import fs from 'fs-extra'
import nock from 'nock'

import './common'
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

  it('should work', function () {
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

    return taida(option).should.be.fulfilled
  })

  it('should exit with unexpected option', function () {
    return taida({}).should.be.rejected
  })

  it('should exit with empty bitmaps', function () {
    let option = {
      pattern: 'undefined.png'
    }
    return taida(option).should.be.rejected
  })

  it('should exit with other format', function () {
    let option = {
      pattern: 'test/fixtures/text.txt'
    }
    return taida(option).should.be.rejected
  })

  it('should work with specified dest', function () {
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

    return taida(option).should.be.fulfilled
      .then(() => {
        expect(fs.readFileSync('test/tmp/dest/1.png')).to.not.be.null
      })
  })

  it('should work with duplicate file', function () {
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
      .get('/some/location')
      .twice()
      .reply(200, new Buffer(10))

    let option = {
      pattern: ['test/tmp/0.png', 'test/tmp/0.png', 'test/tmp/1.png'],
      alternate: true
    }

    return taida(option).should.be.fulfilled
      .then(imgs => {
        expect(imgs).to.be.lengthOf(2)
      })
  })

  it('should work with progress', function (done) {
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
      pattern: 'test/tmp/0.png',
      progress: true
    }

    taida(option)
      .then(() => {
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
