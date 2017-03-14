'use strict';

console.log('test/src/srcsignups.js')

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
// * prospectice participants
const csAdmin = process.env.CLOUDSIM_ADMIN ?
    process.env.CLOUDSIM_ADMIN:'admin'

const csAdminTokenData = {identities: [csAdmin, "src-admins", "src-competitors"]}
let csAdminToken

const srcAdmin = "src-admin"
const srcAdminTokenData = {identities: [srcAdmin, "src-admins"]}
let srcAdminToken

const srcCompetitor = "src-competitor"
const srcCompetitorTokenData = {identities: [srcCompetitor, "src-competitors"]}
let srcCompetitorToken

const srcNew1 = "src-new-user1"
const srcNew1TokenData = {identities: [srcNew1]}
let srcNew1Token

const srcNew2 = "src-new-user2"
const srcNew2TokenData = {identities: [srcNew2]}
let srcNew2Token

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
    // This doesn't work here, see cloudsim-grant issue #13
    csgrant.model.clearDb()

    // Workaround:
    csgrant.saveData('srcsignups', {}, (err)=>{

      should.not.exist(err);

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
          csgrant.token.signToken(srcCompetitorTokenData, (e, tok)=>{
            console.log('token signed for user "' + srcCompetitorTokenData.identities[0]  + '"')
            if(e) {
              console.log('sign error: ' + e)
            }
            srcCompetitorToken = tok
            csgrant.token.signToken(srcNew1TokenData, (e, tok)=>{
              console.log('token signed for user "' + srcNew1TokenData.identities[0]  + '"')
              if(e) {
                console.log('sign error: ' + e)
              }
              srcNew1Token = tok
              csgrant.token.signToken(srcNew2TokenData, (e, tok)=>{
                console.log('token signed for user "' + srcNew2TokenData.identities[0]  + '"')
                if(e) {
                  console.log('sign error: ' + e)
                }
                srcNew2Token = tok
                done()
              })
            })
          })
        })
      })
    })
  })

  describe('Check initial pending registrations with cloudsim admin', function() {
    it('should be empty', function(done) {
      agent
      .get('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', csAdminToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.isAdmin.should.equal(true)
        response.isCompetitor.should.equal(true)
        should.not.exist(response.pending)
        response.pendingList.length.should.equal(0)
        done()
      })
    })
  })

  describe('Check initial pending registrations with competition admin', function() {
    it('should be authorized and empty', function(done) {
      agent
      .get('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', srcAdminToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.isAdmin.should.equal(true)
        response.isCompetitor.should.equal(false)
        should.not.exist(response.pending)
        response.pendingList.length.should.equal(0)
        done()
      })
    })
  })

  describe('Check initial pending registrations with new user', function() {
    it('should be authorized and empty', function(done) {
      agent
      .get('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', srcNew1Token)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.isAdmin.should.equal(false)
        response.isCompetitor.should.equal(false)
        response.pending.should.equal(false)
        should.not.exist(response.pendingList)
        done()
      })
    })
  })

  describe('Admin can\'t request to participate', function() {
    it('should not be successful', function(done) {
      agent
      .post('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', csAdminToken)
      .end(function(err,res) {
        should.not.exist(err);
        should.exist(res);
        res.status.should.be.equal(200);
        res.redirect.should.equal(false);
        const response = JSON.parse(res.text);
        response.success.should.equal(false)
        done()
      })
    })
  })

  describe('Competitors can\'t request to participate again', function() {
    it('should not be successful', function(done) {
      agent
      .post('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', srcCompetitorToken)
      .end(function(err,res) {
        should.not.exist(err);
        should.exist(res);
        res.status.should.be.equal(200);
        res.redirect.should.equal(false);
        const response = JSON.parse(res.text);
        response.success.should.equal(false)
        done()
      })
    })
  })

  describe('New user requests to participate', function() {
    it('should be successfully added to pending list', function(done) {
      agent
      .post('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', srcNew1Token)
      .end(function(err,res) {
        should.not.exist(err);
        should.exist(res);
        res.status.should.be.equal(200);
        res.redirect.should.equal(false);
        const response = JSON.parse(res.text);
        response.success.should.equal(true)
        done()
      })
    })
  })

  describe('Check that new user 2 can\'t see the request from new user 1', function() {
    it('should be authorized and not have a list', function(done) {
      agent
      .get('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', srcNew2Token)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.isAdmin.should.equal(false)
        response.isCompetitor.should.equal(false)
        response.pending.should.equal(false)
        should.not.exist(response.pendingList)
        done()
      })
    })
  })

  describe('New user can\'t request to participate twice', function() {
    it('should not be successfully', function(done) {
      agent
      .post('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', srcNew1Token)
      .end(function(err,res) {
        should.not.exist(err);
        should.exist(res);
        res.status.should.be.equal(200);
        res.redirect.should.equal(false);
        const response = JSON.parse(res.text);
        response.success.should.equal(false)
        done()
      })
    })
  })

  describe('New user 2 also requests to participate', function() {
    it('should be successfully added to pending list', function(done) {
      agent
      .post('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', srcNew2Token)
      .end(function(err,res) {
        should.not.exist(err);
        should.exist(res);
        res.status.should.be.equal(200);
        res.redirect.should.equal(false);
        const response = JSON.parse(res.text);
        response.success.should.equal(true)
        done()
      })
    })
  })

  describe('Check that new user 2 can only see their own request', function() {
    it('should see pending', function(done) {
      agent
      .get('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', srcNew2Token)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.isAdmin.should.equal(false)
        response.isCompetitor.should.equal(false)
        response.pending.should.equal(true)
        should.not.exist(response.pendingList)
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
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.isAdmin.should.equal(true)
        response.isCompetitor.should.equal(true)
        should.not.exist(response.pending)
        response.pendingList.length.should.equal(2)
        response.pendingList[0].should.equal(srcNew1);
        response.pendingList[1].should.equal(srcNew2);
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
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.isAdmin.should.equal(true)
        response.isCompetitor.should.equal(false)
        should.not.exist(response.pending)
        response.pendingList.length.should.equal(2)
        response.pendingList[0].should.equal(srcNew1);
        response.pendingList[1].should.equal(srcNew2);
        done()
      })
    })
  })

  describe('Check it\'s not possible to delete registration without query', function() {
    it('should not be possible to remove user', function(done) {
      agent
      .delete('/srcsignups/')
      .set('Accept', 'application/json')
      .set('authorization', csAdminToken)
      .end(function(err,res) {
        res.status.should.be.equal(400)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(false)
        should.exist(response.error)
        done()
      })
    })
  })

  describe('Check it\'s not possible to delete inexistent user', function() {
    it('should not be possible to remove user', function(done) {
      agent
      .delete('/srcsignups/?username=notauser')
      .set('Accept', 'application/json')
      .set('authorization', csAdminToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(false)
        should.exist(response.msg)
        done()
      })
    })
  })

  describe('Check that src new user 2 can\'t cancel new user 1\'s registration request', function() {
    it('should not be possible to remove another user', function(done) {
      agent
      .delete('/srcsignups/?username=' + srcNew1)
      .set('Accept', 'application/json')
      .set('authorization', srcNew2Token)
      .end(function(err,res) {
        res.status.should.be.equal(401)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(false)
        should.exist(response.error)
        done()
      })
    })
  })

  describe('Check that new user 1 can cancel their own registration request', function() {
    it('should be possible to remove themselves from the list', function(done) {
      agent
      .delete('/srcsignups?username=' + srcNew1)
      .set('Accept', 'application/json')
      .set('authorization', srcNew1Token)
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
    it('should only have new user 2', function(done) {
      agent
      .get('/srcsignups')
      .set('Accept', 'application/json')
      .set('authorization', csAdminToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.isAdmin.should.equal(true)
        response.isCompetitor.should.equal(true)
        should.not.exist(response.pending)
        response.pendingList.length.should.equal(1)
        response.pendingList[0].should.equal(srcNew2);
        done()
      })
    })
  })

  describe('Check that src admin can cancel a user\'s registration request', function() {
    it('should be possible to remove any user from the list', function(done) {
      agent
      .delete('/srcsignups/?username=' + srcNew2)
      .set('Accept', 'application/json')
      .set('authorization', srcAdminToken)
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
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.isAdmin.should.equal(true)
        response.isCompetitor.should.equal(true)
        should.not.exist(response.pending)
        response.pendingList.length.should.equal(0)
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
