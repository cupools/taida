/* eslint-env mocha */

import { expect } from 'chai'
import fs from 'fs-extra'

import apikey from '../src/apikey'

describe('apikey', function () {
  const pathProd = apikey.__path
  const pathTest = 'test/tmp/.apikey'

  before(function () {
    fs.emptyDirSync('test/tmp')
    apikey.__path = pathTest
  })

  after(function () {
    apikey.__path = pathProd
  })

  beforeEach(function () {
    apikey.__apikeys = null
  })

  describe('get', function () {
    it('should init .apikey when file not found', function () {
      expect(apikey.get()).to.be.null
      expect(fs.readJsonSync(pathTest)).to.have.property('apikeys')
        .that.to.be.empty
    })

    it('should abort when .apikey has error', function () {
      fs.outputFileSync(pathTest, 'error')
      expect(apikey.get()).to.be.null
    })

    it('should work', function () {
      writeKeys()
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
      writeKeys()
      apikey.apikeys = 'abc'
      expect(apikey.apikeys).to.have.deep.property('[0].key')
    })
  })

  describe('depress', function () {
  })

  describe('add', function () {})

  describe('delete', function () {})

  function writeKeys(keys = {}) {
    fs.outputJsonSync(pathTest, {
      apikeys: []
        .concat(keys)
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

  function readKeys() {
    return fs.readJsonSync(pathTest)
  }
})
