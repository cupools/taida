/* eslint-env mocha */

import { expect } from 'chai'
import fs from 'fs-extra'
import nock from 'nock'

import './common'
import taida from '../src/index'
import apikey from '../src/apikey'

describe('index', function () {
  this.timeout(1e4)

  beforeEach(function () {
    fs.emptyDirSync('test/tmp')
    fs.copySync('test/fixtures', 'test/tmp')
    nock.cleanAll()
    apikey.clear()
  })

  it('should work', function (done) {
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
      alternate: true,
      apikeys: 'xxx'
    }

    return taida(option).should.be.fulfilled.then(function (ret) {
      ret.should.have.deep.property('[0].path', 'test/tmp/1.png')
      ret.should.not.have.deep.property('[0].error')
    }).should.notify(done)
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
      .reply(200, new Buffer(10))

    let option = {
      pattern: 'test/tmp/1.png',
      apikeys: ['xxx', 'yyy']
    }

    return taida(option).should.eventually.not.have.deep.property('[0].error')
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
      dest: 'test/tmp/dest',
      apikeys: ['xxx']
    }

    return taida(option).should.be.fulfilled
      .then(() => {
        expect(fs.existsSync('test/tmp/dest/1.png')).to.be.ok
        expect(fs.existsSync('test/tmp/dest/bad.png')).to.be.false
      })
  })

  it('should work with duplicate file', function () {
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
      alternate: true,
      apikeys: ['xxx']
    }

    return taida(option).should.be.fulfilled
      .then(imgs => {
        expect(imgs).to.be.lengthOf(2)
        expect(imgs.filter(item => item.error)).to.be.lengthOf(0)
      })
  })

  it('should work with progress', function () {
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
      progress: true,
      apikeys: 'xxx'
    }

    return taida(option).should.eventually.not.have.deep.property('[0].error')
  })
})
