/* eslint-env mocha */

import { expect } from 'chai'
import fs from 'fs-extra'

import {writeKeys, readKeys} from './utils'
import apikeyCore from '../src/apikey'
import apikey from '../src/cmd/apikey'

describe('cmd/apikey', function () {
  const pathProd = apikeyCore.__path
  const pathTest = 'test/tmp/.apikey'

  before(function () {
    apikeyCore.__apikeys = null
    apikeyCore.__path = pathTest
  })

  after(function () {
    apikeyCore.__path = pathProd
  })

  beforeEach(function () {
    fs.emptyDirSync('test/tmp')
    apikeyCore.__apikeys = null
  })

  describe('.add', function () {
    it('should work', function () {
      apikey.add('xxx')
      expect(readKeys()).to.have.deep.property('apikeys[0].key', 'xxx')
      apikey.add('xxx')
      expect(readKeys()).to.have.property('apikeys')
        .that.to.be.lengthOf(1)
      apikey.add('yyy')
      expect(readKeys()).to.have.property('apikeys')
        .that.to.be.lengthOf(2)
    })
  })

  describe('.use', function () {
    it('should work', function () {
      apikey.add('xxx')
      expect(readKeys()).to.have.deep.property('apikeys[0].key', 'xxx')
      apikey.add('yyy')
      expect(readKeys()).to.have.deep.property('apikeys[1].key', 'yyy')
      apikey.use('yyy')
      expect(readKeys()).to.have.deep.property('apikeys[0].key', 'yyy')
      apikey.use(1)
      expect(readKeys()).to.have.deep.property('apikeys[0].key', 'xxx')
      apikey.use(2)
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

      apikey.delete('xxx')
      expect(readKeys()).to.have.deep.property('apikeys[0].key', 'yyy')
      apikey.delete('xxx')
      apikey.delete(1)
      expect(readKeys()).to.have.deep.property('apikeys[0].key', 'yyy')
        .and.not.have.deep.property('apikeys[1]')
    })
  })

  describe('.list', function () {
    it('should work', function () {
      writeKeys([{
        key: 'xxx'
      }, {
        key: 'yyy'
      }, {
        key: 'zzz',
        valid: false
      }])
      apikey.list()
    })

    it('should log tips for empty list', function () {
      writeKeys([])
      apikey.list()
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
      apikey.clear()
      expect(readKeys()).to.have.property('apikeys')
        .that.to.be.empty
    })
  })
})