'use strict';

console.log('test/src/registrations.js')

const util = require('util')
const should = require('should')
const supertest = require('supertest')

// current dir: test
const app = require('../../server/cloudsim_widgets')
const agent = supertest.agent(app)

const csgrant = require('cloudsim-grant')
const token = csgrant.token

// we need fresh keys for this test
const keys = csgrant.token.generateKeys()
token.initKeys(keys.public, keys.private)

// Three users for testing:
// * cloudsim admin
// * competition admin
// * competition participant
const csAdmin = process.env.CLOUDSIM_ADMIN ?
    process.env.CLOUDSIM_ADMIN:'csAdmin'

const csAdminTokenData = {username: csAdmin}
let csAdminToken

const srcAdmin = "src-admin"
const srcAdminTokenData = {username: srcAdmin}
let srcAdminToken

const srcComp = "src-competitor"
const srcCompTokenData = {username: srcComp}
let srcCompToken

function getResponse(res, print) {
  const response = JSON.parse(res.text)
  if(print) {
    csgrant.dump()
    console.trace(JSON.stringify(response, null, 2 ))
  }
  return response
}

describe('<Unit test Machine types>', function() {

  before(function(done) {
    token.signToken(csAdminTokenData, (e, tok)=>{
      console.log('token signed for user "' + csAdmin + '"')
      if(e) {
        console.log('sign error: ' + e)
        should.fail()
      }
      csAdminToken = tok
      csgrant.token.signToken(srcAdminTokenData, (e, tok)=>{
        console.log('token signed for user "' + srcAdminTokenData.username  + '"')
        if(e) {
          console.log('sign error: ' + e)
        }
        srcAdminToken = tok
        csgrant.token.signToken(srcCompTokenData, (e, tok)=>{
          console.log('token signed for user "' + srcCompTokenData.username  + '"')
          if(e) {
            console.log('sign error: ' + e)
          }
          srcCompToken = tok
          done()
        })
      })
    })
  })

  describe('Check initial registrations with cloudsim admin', function() {
    it('should be empty', function(done) {
      agent
      .get('/srcregistrations')
      .set('Accept', 'application/json')
      .set('authorization', csAdminToken)
      .send({})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(csAdmin)
        response.result.length.should.equal(0)
        done()
      })
    })
  })

  describe('Check initial registrations with competition admin', function() {
    it('should be authorized and empty', function(done) {
      agent
      .get('/srcregistrations')
      .set('Accept', 'application/json')
      .set('authorization', srcAdminToken)
      .send({})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(srcAdmin)
        response.result.length.should.equal(0)
        done()
      })
    })
  })

  describe('Check initial registrations with competitor', function() {
    it('should be authorized and empty', function(done) {
      agent
      .get('/srcregistrations')
      .set('Accept', 'application/json')
      .set('authorization', srcCompToken)
      .send({})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(srcComp)
        response.result.length.should.equal(0)
        done()
      })
    })
  })

  let registrationId;
  describe('Competitor requests to participate', function() {
    it('should successfully create a resource', function(done) {
      agent
      .post('/srcregistrations')
      .set('Accept', 'application/json')
      .set('authorization', srcCompToken)
      .send({})
      .end(function(err,res) {
        should.not.exist(err);
        should.exist(res);
        res.status.should.be.equal(200);
        res.redirect.should.equal(false);
        const response = JSON.parse(res.text);
        response.success.should.equal(true)
        registrationId = response.id
        done()
      })
    })
  })

  describe('Check that cloudsim admin can see registration', function() {
    it('should see one registration', function(done) {
      agent
      .get('/srcregistrations')
      .set('Accept', 'application/json')
      .set('authorization', csAdminToken)
      .send({})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(csAdmin)
        response.result.length.should.equal(1)
        response.result[0].name.should.equal(registrationId);
        response.result[0].data.username.should.equal(srcComp);
        done()
      })
    })
  })

  describe('Check that src admin can\'t see registration before being made admin', function() {
    it('should be empty', function(done) {
      agent
      .get('/srcregistrations')
      .set('Accept', 'application/json')
      .set('authorization', srcAdminToken)
      .send({})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(srcAdmin)
        response.result.length.should.equal(0)
        done()
      })
    })
  })

  describe('Check that src admin can\'t see registration before being made admin', function() {
    it('should be empty', function(done) {
      agent
      .get('/srcregistrations')
      .set('Accept', 'application/json')
      .set('authorization', srcAdminToken)
      .send({})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(srcAdmin)
        response.result.length.should.equal(0)
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
