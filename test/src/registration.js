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

const csAdminTokenData = {identities: [csAdmin]}
let csAdminToken

const srcAdmin = "src-admin"
const srcAdminTokenData = {identities: [srcAdmin, "src-admins"]}
let srcAdminToken

const srcComp1 = "src-competitor1"
const srcComp1TokenData = {identities: [srcComp1]}
let srcComp1Token

const srcComp2 = "src-competitor2"
const srcComp2TokenData = {identities: [srcComp2]}
let srcComp2Token

function getResponse(res, print) {
  const response = JSON.parse(res.text)
  if(print) {
    csgrant.dump()
    console.trace(JSON.stringify(response, null, 2 ))
  }
  return response
}

describe('<Unit test SRC signups>', function() {

  before(function(done) {
    token.signToken(csAdminTokenData, (e, tok)=>{
      console.log('token signed for user "' + csAdmin + '"')
      if(e) {
        console.log('sign error: ' + e)
        should.fail()
      }
      csAdminToken = tok
      csgrant.token.signToken(srcAdminTokenData, (e, tok)=>{
        console.log('token signed for user "' + srcAdminTokenData.identities[0]  + '"')
        if(e) {
          console.log('sign error: ' + e)
        }
        srcAdminToken = tok
        csgrant.token.signToken(srcComp1TokenData, (e, tok)=>{
          console.log('token signed for user "' + srcComp1TokenData.identities[0]  + '"')
          if(e) {
            console.log('sign error: ' + e)
          }
          srcComp1Token = tok
          csgrant.token.signToken(srcComp2TokenData, (e, tok)=>{
            console.log('token signed for user "' + srcComp2TokenData.identities[0]  + '"')
            if(e) {
              console.log('sign error: ' + e)
            }
            srcComp2Token = tok
            done()
          })
        })
      })
    })
  })

  describe('Check initial registrations with cloudsim admin', function() {
    it('should be empty', function(done) {
      agent
      .get('/srcsignups')
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
      .get('/srcsignups')
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
      .get('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', srcComp1Token)
      .send({})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(srcComp1)
        response.result.length.should.equal(0)
        done()
      })
    })
  })

  let registrationId1;
  describe('Competitor requests to participate', function() {
    it('should successfully create a resource', function(done) {
      agent
      .post('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', srcComp1Token)
      .send({})
      .end(function(err,res) {
        should.not.exist(err);
        should.exist(res);
        res.status.should.be.equal(200);
        res.redirect.should.equal(false);
        const response = JSON.parse(res.text);
        response.success.should.equal(true)
        registrationId1 = response.id
        done()
      })
    })
  })

  describe('Check that competitor2 can\'t see the request from competitor1', function() {
    it('should be authorized and empty', function(done) {
      agent
      .get('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', srcComp2Token)
      .send({})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(srcComp2)
        response.result.length.should.equal(0)
        done()
      })
    })
  })

  let registrationId2;
  describe('Competitor 2 also requests to participate', function() {
    it('should successfully create a resource', function(done) {
      agent
      .post('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', srcComp2Token)
      .send({})
      .end(function(err,res) {
        should.not.exist(err);
        should.exist(res);
        res.status.should.be.equal(200);
        res.redirect.should.equal(false);
        const response = JSON.parse(res.text);
        response.success.should.equal(true)
        registrationId2 = response.id
        done()
      })
    })
  })

  describe('Check that competitor2 can only see their own request', function() {
    it('should be authorized and empty', function(done) {
      agent
      .get('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', srcComp2Token)
      .send({})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(srcComp2)
        response.result.length.should.equal(1)
        response.result[0].name.should.equal(registrationId2);
        response.result[0].data.username.should.equal(srcComp2);
        done()
      })
    })
  })

  describe('Check that cloudsim admin can see both registrations', function() {
    it('should see two registrations', function(done) {
      agent
      .get('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', csAdminToken)
      .send({})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(csAdmin)
        response.result.length.should.equal(2)
        response.result[0].name.should.equal(registrationId1);
        response.result[0].data.username.should.equal(srcComp1);
        response.result[1].name.should.equal(registrationId2);
        response.result[1].data.username.should.equal(srcComp2);
        done()
      })
    })
  })

  describe('Check that src admin can see both registrations', function() {
    it('should see two registrations', function(done) {
      agent
      .get('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', srcAdminToken)
      .send({})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(srcAdmin)
        response.result.length.should.equal(2)
        response.result[0].name.should.equal(registrationId1);
        response.result[0].data.username.should.equal(srcComp1);
        response.result[1].name.should.equal(registrationId2);
        response.result[1].data.username.should.equal(srcComp2);
        done()
      })
    })
  })

  describe('Check that src competitor 2 can\'t cancel competitor 1\'s registration request', function() {
    it('should not be possible to remove another user', function(done) {
      agent
      .delete('/srcsignups/' + registrationId1)
      .set('Accept', 'application/json')
      .set('authorization', srcComp2Token)
      .send({})
      .end(function(err,res) {
        res.status.should.be.equal(401)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(false)
        done()
      })
    })
  })

  describe('Check that competitor 1 can cancel their own registration request', function() {
    it('should be possible to remove themselves from the list', function(done) {
      agent
      .delete('/srcsignups/' + registrationId1)
      .set('Accept', 'application/json')
      .set('authorization', srcComp1Token)
      .send({})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        done()
      })
    })
  })

  describe('Check with cloudsim admin that registration request was removed', function() {
    it('should only have competitor 2', function(done) {
      agent
      .get('/srcsignups')
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
        response.result[0].name.should.equal(registrationId2);
        response.result[0].data.username.should.equal(srcComp2);
        done()
      })
    })
  })

  describe('Check that src admin can cancel a user\'s registration request', function() {
    it('should be possible to remove any user from the list', function(done) {
      agent
      .delete('/srcsignups/' + registrationId2)
      .set('Accept', 'application/json')
      .set('authorization', srcAdminToken)
      .send({})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        done()
      })
    })
  })

  describe('Check with cloudsim admin that there are no requests left', function() {
    it('should be empty', function(done) {
      agent
      .get('/srcsignups')
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

  after(function(done) {
    console.log('after everything')
    csgrant.model.clearDb()
    done()
  })

})
