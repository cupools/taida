/* eslint-env mocha */

import { expect } from 'chai'
import fs from 'fs-extra'

import apikey from '../src/apikey'

describe('apikey', function () {
  beforeEach(function () {
    apikey.clear()
  })

  describe('.config', function () {
    it('should set apikeys as string success', function () {
      expect(apikey.apikeys).to.be.lengthOf(0)

      apikey.config({ apikeys: 'xxx' })
      expect(apikey.get()).to.equal('xxx')
    })

    it('should set apikeys as array success', function () {
      expect(apikey.apikeys).to.be.lengthOf(0)

      apikey.config({ apikeys: ['xxx', 'yyy'] })
      expect(apikey.get()).to.equal('xxx')
      expect(apikey.apikeys).to.have.deep.property('[1].key', 'yyy')
    })

    it('should set apikeys as object success', function () {
      expect(apikey.apikeys).to.be.lengthOf(0)

      apikey.config({
        apikeys: [{
          key: 'xxx',
          valid: false,
          date: Date.now()
        }, {
          key: 'yyy',
          valid: true,
          date: Date.now()
        }]
      })
      expect(apikey.get()).to.equal('yyy')
      expect(apikey.apikeys).to.have.deep.property('[1].key', 'yyy')
    })

    it('should set apikeys directly', function () {
      expect(apikey.apikeys).to.be.lengthOf(0)

      apikey.apikeys = 'xxx'
      expect(apikey.get()).to.equal('xxx')
    })
  })

  describe('.get', function () {
    it('should work', function () {
      expect(apikey.get()).to.equal(null)
      apikey.config({ apikeys: 'xxx' })
      expect(apikey.get()).to.equal('xxx')
    })

    it('should get valid key', function () {
      apikey.config({
        apikeys: [{
          key: 'xxx',
          date: Date.now(),
          valid: false
        }, {
          key: 'yyy',
          date: Date.now(),
          valid: true
        }]
      })
      expect(apikey.get()).to.equal('yyy')
    })

    it('should revise invalid apikey created long ago', function () {
      apikey.config({
        apikeys: [{
          key: 'xxx',
          date: Date.now() - 2 * 24 * 3600 * 1e3,
          valid: false
        }, {
          key: 'yyy',
          date: Date.now(),
          valid: true
        }]
      })

      expect(apikey.get()).to.equal('xxx')
      expect(apikey.apikeys).to.be.lengthOf(2)
      expect(apikey.apikeys).to.have.deep.property('[0].valid', true)
    })

    it('should get default key when alternate disabled', function () {
      apikey.config({ apikeys: ['xxx', 'yyy'] })

      apikey.alternate = false
      expect(apikey.get()).to.equal('xxx')
      expect(apikey.depress('xxx')).to.equal('xxx')
      expect(apikey.get()).to.be.null
      apikey.alternate = true
      expect(apikey.get()).to.equal('yyy')

      apikey.clear()
      expect(apikey.get()).to.be.null
    })
  })

  describe('.set', function () {
  })

  describe('.depress', function () {
    it('should work', function () {
      apikey.config({
        apikeys: [{
          key: 'xxx',
          date: Date.now(),
          valid: true
        }, {
          key: 'yyy',
          date: Date.now(),
          valid: true
        }, {
          key: 'zzz',
          date: Date.now(),
          valid: false
        }]
      })

      expect(apikey.depress('xxx')).to.equal('xxx')
      expect(apikey.get()).to.equal('yyy')
      expect(apikey.depress('yyy')).to.equal('yyy')
      expect(apikey.get()).to.be.null
      expect(apikey.depress('zzz')).to.equal('zzz')
      expect(apikey.depress('undefined')).to.be.false

      expect(apikey.apikeys).to.be.lengthOf(3)
      expect(apikey.apikeys).to.have.deep.property('[0].valid')
        .that.to.be.false
    })
  })

  describe('.add', function () {
    it('should work', function () {
      expect(apikey.add('xxx')).to.contain('xxx')
      expect(apikey.apikeys).to.have.deep.property('[0].key', 'xxx')
      expect(apikey.add('xxx')).to.be.false
      expect(apikey.apikeys).to.be.lengthOf(1)
      expect(apikey.add('yyy')).to.contain('yyy')
      expect(apikey.apikeys).to.be.lengthOf(2)
    })
  })

  describe('.remove', function () {
    it('should work', function () {
      apikey.config({ apikeys: ['xxx', 'yyy', 'zzz'] })

      expect(apikey.remove('xxx')).to.have.deep.property('[0]', 'xxx')
      expect(apikey.apikeys).to.have.deep.property('[0].key', 'yyy')
      expect(apikey.remove('xxx')).to.be.false
      expect(apikey.remove('zzz')).to.have.deep.property('[0]', 'zzz')
      expect(apikey.apikeys).to.be.lengthOf(1)
        .that.to.have.deep.property('[0].key', 'yyy')
    })
  })

  describe('.list', function () {
    it('should work', function () {
      apikey.config({ apikeys: ['xxx', 'yyy', 'zzz'] })

      expect(apikey.list()).to.be.lengthOf(3)
    })
  })

  describe('.clear', function () {
    it('should work', function () {
      apikey.config({ apikeys: ['xxx', 'yyy', 'zzz'] })

      expect(apikey.clear()).to.be.empty
      expect(apikey.get()).to.be.null
    })
  })

  describe('.fromArray', function () {
    it('should work', function () {
      apikey.fromArray(['xxx', 'yyy'])
      expect(apikey.get()).to.equal('xxx')
      expect(apikey.apikeys).to.have.deep.property('[1].key', 'yyy')
    })
  })

  describe('.fromJSONFile', function () {
    before(function () {
      fs.copySync('test/fixtures/jsonfile.json', 'test/tmp/jsonfile.json')
    })

    it('should work', function () {
      apikey.fromJSONFile('test/tmp/jsonfile.json')
      expect(apikey.get()).to.equal('xxx')
      expect(apikey.apikeys).to.have.deep.property('[1].key', 'yyy')
    })
  })
})
