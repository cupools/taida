/* eslint-env mocha */

import { expect } from 'chai'
import fs from 'fs-extra'

import { writeKeys, readKeys } from './utils'
import apikeyCore from '../src/apikey'
import apikey from '../src/cmd/apikey'

describe('cmd/apikey', function () {
  const pathProd = apikey.__path
  const pathTest = 'test/tmp/.apikey'

  before(function () {
    apikey.__path = pathTest
  })

  after(function () {
    apikey.__path = pathProd
  })

  beforeEach(function () {
    fs.emptyDirSync('test/tmp')
    apikeyCore.clear()
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

  describe('.initKeys', function () {
    it('should work', function () {
      writeKeys([{
        key: 'xxx'
      }])

      apikey.initKeys()
      expect(apikeyCore).to.have.deep.property('apikeys[0].key', 'xxx')
    })

    it('should throw exception with error in .apikey', function () {
      fs.outputFileSync(pathTest, 'error')
      expect(() => apikey.initKeys()).to.throw(Error)
    })

    it('should build .apikey when necessary', function () {
      apikey.initKeys()
      expect(readKeys()).to.have.property('apikeys')
        .that.to.be.empty
    })
  })
})
