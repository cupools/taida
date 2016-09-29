/* eslint-env mocha */

import { expect } from 'chai'
import fs from 'fs-extra'

import apikey from '../src/apikey'

describe('apikey', function () {
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
    apikey.__apikeys = null
  })

  describe('get', function () {
    it('should init .apikey when file not found', function () {
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
      expect(apikey.get()).to.be.equal('xxx')
      expect(apikey.get()).to.be.equal('xxx')
    })

    it('should get valid key', function () {
      writeKeys([{
        key: 'xxx',
        valid: false
      }, {
        key: 'yyy',
        valid: true
      }])
      expect(apikey.get()).to.be.equal('yyy')
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
      expect(apikey.get()).to.be.equal('xxx')

      let json = readKeys()

      expect(json).to.have.deep.property('apikeys[0].valid', true)
      expect(json).to.have.property('apikeys')
        .that.to.be.lengthOf(2)
    })
  })

  describe('set', function () {
    it('should not have change', function () {
      writeKeys({
        key: 'xxx'
      })
      apikey.apikeys = 'abc'
      expect(apikey.apikeys).to.have.deep.property('[0].key')
    })
  })

  describe('depress', function () {
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
      apikey.depress('xxx')
      expect(apikey.get()).to.equal('yyy')
      apikey.depress('yyy')
      expect(apikey.get()).to.be.null
      apikey.depress('zzz')

      let json = readKeys()
      expect(json.apikeys).to.be.lengthOf(3)
      expect(json.apikeys).to.have.deep.property('[0].valid')
        .that.to.be.false
    })
  })

  describe('add', function () {
    it('should work', function () {
      apikey.add('xxx')
      expect(readKeys()).to.have.deep.property('apikeys[0].key', 'xxx')
      apikey.add('xxx')
      expect(readKeys()).to.have.property('apikeys')
        .that.to.be.lengthOf(1)
    })
  })

  describe('delete', function () {})

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

  function readKeys() {
    return fs.readJsonSync(pathTest)
  }
})
