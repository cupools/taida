/* eslint-env mocha */

import { expect } from 'chai'
import fs from 'fs-extra'

import {writeKeys, readKeys} from './utils'
import apikey from '../src/apikey'

describe('apikey', function () {
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
    fs.emptyDirSync('test/tmp')
    apikey.__apikeys = null
  })

  describe('.get', function () {
    it('should init .apikey when file not found', function () {
      expect(apikey.get()).to.be.null
      expect(apikey.get()).to.be.null
      expect(readKeys()).to.have.property('apikeys')
        .that.to.be.empty
    })

    it('should abort when .apikey has error', function () {
      writeKeys('error')
      expect(apikey.get()).to.be.null
    })

    it('should work', function () {
      writeKeys({
        key: 'xxx'
      })
      expect(apikey.get()).to.equal('xxx')
      expect(apikey.get()).to.equal('xxx')
    })

    it('should get valid key', function () {
      writeKeys([{
        key: 'xxx',
        valid: false
      }, {
        key: 'yyy',
        valid: true
      }])
      expect(apikey.get()).to.equal('yyy')
    })

    it('should revise invalid apikey created long ago', function () {
      writeKeys([{
        key: 'xxx',
        date: Date.now() - 2 * 24 * 3600 * 1e3,
        valid: false
      }, {
        key: 'yyy',
        valid: true
      }])
      expect(apikey.get()).to.equal('xxx')

      let json = readKeys()

      expect(json).to.have.deep.property('apikeys[0].valid', true)
      expect(json).to.have.property('apikeys')
        .that.to.be.lengthOf(2)
    })

    it('should get default key when alternate disabled', function () {
      writeKeys([{
        key: 'xxx'
      }, {
        key: 'yyy'
      }])

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
    it('should not have change', function () {
      writeKeys({
        key: 'xxx'
      })
      apikey.apikeys = 'abc'
      expect(apikey.apikeys).to.have.deep.property('[0].key')
    })
  })

  describe('.depress', function () {
    it('should work', function () {
      writeKeys([{
        key: 'xxx',
        valid: true
      }, {
        key: 'yyy',
        valid: true
      }, {
        key: 'zzz',
        valid: false
      }])

      expect(apikey.get()).to.equal('xxx')
      expect(apikey.depress('xxx')).to.equal('xxx')
      expect(apikey.get()).to.equal('yyy')
      expect(apikey.depress('yyy')).to.equal('yyy')
      expect(apikey.get()).to.be.null
      expect(apikey.depress('zzz')).to.equal('zzz')
      expect(apikey.depress('undefined')).to.be.false

      let json = readKeys()
      expect(json.apikeys).to.be.lengthOf(3)
      expect(json.apikeys).to.have.deep.property('[0].valid')
        .that.to.be.false
    })
  })

  describe('.add', function () {
    it('should work', function () {
      expect(apikey.add('xxx')).to.contain('xxx')
      expect(readKeys()).to.have.deep.property('apikeys[0].key', 'xxx')
      expect(apikey.add('xxx')).to.be.false
      expect(readKeys()).to.have.property('apikeys')
        .that.to.be.lengthOf(1)
      expect(apikey.add('yyy')).to.contain('yyy')
      expect(readKeys()).to.have.property('apikeys')
        .that.to.be.lengthOf(2)
    })
  })

  describe('.use', function () {
    it('should work', function () {
      expect(apikey.add('xxx')).to.contain('xxx')
      expect(readKeys()).to.have.deep.property('apikeys[0].key', 'xxx')
      expect(apikey.add('yyy')).to.contain('yyy')
      expect(readKeys()).to.have.deep.property('apikeys[1].key', 'yyy')
      expect(apikey.use('yyy')).to.equal('yyy')
      expect(readKeys()).to.have.deep.property('apikeys[0].key', 'yyy')
      expect(apikey.use(1)).to.equal('xxx')
      expect(readKeys()).to.have.deep.property('apikeys[0].key', 'xxx')
      expect(apikey.use(2)).to.be.false
      expect(readKeys()).to.have.deep.property('apikeys[0].key', 'xxx')
    })
  })

  describe('.delete', function () {
    it('should work', function () {
      writeKeys([{
        key: 'xxx'
      }, {
        key: 'yyy'
      }, {
        key: 'zzz'
      }])

      expect(apikey.delete('xxx')).to.equal('xxx')
      expect(readKeys()).to.have.deep.property('apikeys[0].key', 'yyy')
      expect(apikey.delete('xxx')).to.be.false
      expect(apikey.delete(1)).to.equal('zzz')
      expect(readKeys()).to.have.property('apikeys')
        .that.to.be.lengthOf(1)
        .that.to.have.deep.property('[0].key', 'yyy')
    })
  })

  describe('.list', function () {
    it('should work', function () {
      writeKeys([{
        key: 'xxx'
      }, {
        key: 'yyy'
      }, {
        key: 'zzz'
      }])
      expect(apikey.list()).to.be.lengthOf(3)
    })
  })

  describe('.clear', function () {
    it('should work', function () {
      writeKeys([{
        key: 'xxx'
      }, {
        key: 'yyy'
      }, {
        key: 'zzz'
      }])
      expect(apikey.clear()).to.be.empty
      expect(apikey.get()).to.be.null
    })
  })
})
