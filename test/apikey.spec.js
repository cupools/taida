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

  describe('get', function () {
    it('should init .apikey when file not found', function () {
      expect(apikey.get()).to.be.null
      expect(fs.readJsonSync(pathTest)).to.have.property('apikeys')
        .that.to.be.empty
    })

    it('should abort when .apikey has error', function () {
      fs.writeFileSync(pathTest, 'error')
      expect(apikey.get()).to.be.null
    })

    it('should work', function () {
      fs.outputJsonSync(pathTest, {
        apikeys: ['ok']
      })
      apikey.__apikeys = null

      expect(apikey.get()).to.be.equal('ok')
    })
  })

  describe('add', function () {})

  describe('delete', function () {})
})
