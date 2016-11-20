'use strict';

const should = require('should')
const supertest = require('supertest')

// current dir: test
const app = require('../server/cloudsim_widgets')
const agent = supertest.agent(app)

const csgrant = require('cloudsim-grant')
const token = csgrant.token


// we need fresh keys for this test
const keys = csgrant.token.generateKeys()
token.initKeys(keys.public, keys.private)

describe('<Unit test Widgets>', function() {

  describe('Make a request', function() {
    it('should be possible to get config.js', function(done) {
      agent
      .get('/scripts/config.js')
      .set('Accept', 'application/json')
      .send({})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        if(res.text.indexOf ('getConfig') < 0) {
          should.fail()
        }
        done()
      })
    })

    it('should be possible to get /', function(done) {
      agent
      .get('/')
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        done()
      })
    })

    it('should be possible to get /home', function(done) {
      agent
      .get('/home')
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        done()
      })
    })
  })

  after(function(done) {
    console.log('after everything')
    csgrant.model.clearDb()
    done()
  })

})
