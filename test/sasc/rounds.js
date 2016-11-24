'use strict';

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
// * admin
// * competitor
// * non-participant
const sascAdmin = "sasc-admin"
const sascAdminTokenData = {identities: [sascAdmin, "sasc-admins"]}
let sascAdminToken

const blueCompetitor = "blue-competitor"
const blueCompetitorTokenData = {identities: [blueCompetitor, "sasc-competitors"]}
let blueCompetitorToken

const goldCompetitor = "gold-competitor"
const goldCompetitorTokenData = {identities: [goldCompetitor, "sasc-competitors"]}
let goldCompetitorToken

const notCompetitor = "not-competitor"
const notCompetitorTokenData = {identities: [notCompetitor]}
let notCompetitorToken

function getResponse(res, print) {
  const response = JSON.parse(res.text)
  if(print) {
    csgrant.dump()
    console.trace(JSON.stringify(response, null, 2 ))
  }
  return response
}

describe('<Unit test SASC rounds>', function() {

  before(function(done) {
    csgrant.model.clearDb()

    csgrant.token.signToken(sascAdminTokenData, (e, tok)=>{
      if(e) {
        console.log('sign error: ' + e)
      }
      sascAdminToken = tok
      csgrant.token.signToken(blueCompetitorTokenData, (e, tok)=>{
        if(e) {
          console.log('sign error: ' + e)
        }
        blueCompetitorToken = tok
        csgrant.token.signToken(goldCompetitorTokenData, (e, tok)=>{
          if(e) {
            console.log('sign error: ' + e)
          }
          goldCompetitorToken = tok
          csgrant.token.signToken(notCompetitorTokenData, (e, tok)=>{
            if(e) {
              console.log('sign error: ' + e)
            }
            notCompetitorToken = tok
            done()
          })
        })
      })
    })
  })

  describe('Check initial rounds with admin', function() {
    it('should be empty', function(done) {
      agent
      .get('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', sascAdminToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(sascAdmin)
        response.result.length.should.equal(0)
        done()
      })
    })
  })

  describe('Check initial rounds with competitor', function() {
    it('should be empty', function(done) {
      agent
      .get('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', blueCompetitorToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(blueCompetitor)
        response.result.length.should.equal(0)
        done()
      })
    })
  })

  describe('Check initial rounds with non-competitor', function() {
    it('should be empty', function(done) {
      agent
      .get('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', notCompetitorToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(notCompetitor)
        response.result.length.should.equal(0)
        done()
      })
    })
  })

  describe('Start a new round with competitor', function() {
    it('should not be authorized', function(done) {
      agent
      .post('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', blueCompetitorToken)
      .end(function(err,res) {
        res.status.should.be.equal(401)
        done()
      })
    })
  })

  describe('Start a new round with admin, missing fields', function() {
    it('should return a bad request error', function(done) {
      agent
      .post('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', sascAdminToken)
      .end(function(err,res) {
        res.status.should.be.equal(400)
        done()
      })
    })
  })

  let roundName = 'Test round'
  describe('Start a new round with admin', function() {
    it('should create a resource with the correct permissions', function(done) {
      agent
      .post('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', sascAdminToken)
      .send({'name': roundName, 'blueuser': blueCompetitor, 'golduser': goldCompetitor})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        let response = getResponse(res)
        response.success.should.equal(true)

        // Input data
        response.result.data.name.should.equal(roundName)
        response.result.data.blueuser.should.equal(blueCompetitor)
        response.result.data.golduser.should.equal(goldCompetitor)

        // Permissions
        response.result.permissions[sascAdmin].readOnly.should.equal(false)
        response.result.permissions['sasc-admins'].readOnly.should.equal(false)
        response.result.permissions[blueCompetitor].readOnly.should.equal(true)
        response.result.permissions[goldCompetitor].readOnly.should.equal(true)
        done()
      })
    })
  })

  let roundId
  describe('Get rounds with admin', function() {
    it('should have one round', function(done) {
      agent
      .get('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', sascAdminToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(sascAdmin)
        response.result.length.should.equal(1)

        // Round data
        roundId = response.result[0].name
        roundId.indexOf('sascround').should.be.above(-1)

        response.result[0].data.name.should.equal(roundName)
        response.result[0].data.blueuser.should.equal(blueCompetitor)
        response.result[0].data.golduser.should.equal(goldCompetitor)

        // Permissions
        response.result[0].permissions.length.should.equal(4)
        response.result[0].permissions[0].username.should.equal(sascAdmin)
        response.result[0].permissions[0].permissions.readOnly.should.equal(false)
        response.result[0].permissions[1].username.should.equal('sasc-admins')
        response.result[0].permissions[1].permissions.readOnly.should.equal(false)
        response.result[0].permissions[2].username.should.equal(blueCompetitor)
        response.result[0].permissions[2].permissions.readOnly.should.equal(true)
        response.result[0].permissions[3].username.should.equal(goldCompetitor)
        response.result[0].permissions[3].permissions.readOnly.should.equal(true)

        done()
      })
    })
  })

  describe('Get rounds with competitor', function() {
    it('should have one round', function(done) {
      agent
      .get('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', blueCompetitorToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(blueCompetitor)
        response.result.length.should.equal(1)

        // Round data
        response.result[0].name.should.equal(roundId)
        response.result[0].data.name.should.equal(roundName)
        response.result[0].data.blueuser.should.equal(blueCompetitor)
        response.result[0].data.golduser.should.equal(goldCompetitor)

        // Permissions
        should.not.exist(response.result[0].permissions)

        done()
      })
    })
  })

  describe('Update round with competitor', function() {
    it('should not be authorized', function(done) {
      agent
      .put('/sascrounds/' + roundId)
      .set('Accept', 'application/json')
      .set('authorization', blueCompetitorToken)
      .end(function(err,res) {
        res.status.should.be.equal(401)
        done()
      })
    })
  })

  describe('Add arbiter data to round with admin', function() {
    it('should append data', function(done) {
      agent
      .put('/sascrounds/' + roundId)
      .set('Accept', 'application/json')
      .set('authorization', sascAdminToken)
      .send({
        'arbiter': {
          'public': {
            'status' : 'LAUNCHING'
          },
          'secure': {
            'status' : 'LAUNCHING'
          }
        }
      })
      .end(function(err,res) {
        res.status.should.be.equal(200)
        let response = getResponse(res)
        response.success.should.equal(true)

        // Existing data was not overriden
        response.result.data.name.should.equal(roundName)
        response.result.data.blueuser.should.equal(blueCompetitor)
        response.result.data.golduser.should.equal(goldCompetitor)

        // New data is present
        should.exist(response.result.data.arbiter)
        should.exist(response.result.data.arbiter.secure)
        should.exist(response.result.data.arbiter.public)
        done()
      })
    })
  })

  describe('Add payloads data to round with admin', function() {
    it('should append data', function(done) {
      agent
      .put('/sascrounds/' + roundId)
      .set('Accept', 'application/json')
      .set('authorization', sascAdminToken)
      .send({
        'bluepayloads': [ {
          'status' : 'LAUNCHING',
          'options': {
            'secret' : 'secret stuff can go here'
          }
        }],
        'goldpayloads': [ {
          'status' : 'LAUNCHING',
          'options': {
            'secret' : 'secret stuff can go here'
          }
        }]
      })
      .end(function(err,res) {
        res.status.should.be.equal(200)
        let response = getResponse(res)
        response.success.should.equal(true)

        // Existing data was not overriden
        response.result.data.name.should.equal(roundName)
        response.result.data.blueuser.should.equal(blueCompetitor)
        response.result.data.golduser.should.equal(goldCompetitor)
        should.exist(response.result.data.arbiter)
        should.exist(response.result.data.arbiter.secure)
        should.exist(response.result.data.arbiter.public)

        // New data is present
        should.exist(response.result.data.bluepayloads)
        response.result.data.bluepayloads.length.should.equal(1)
        should.exist(response.result.data.bluepayloads[0].options)

        should.exist(response.result.data.goldpayloads)
        response.result.data.goldpayloads.length.should.equal(1)
        should.exist(response.result.data.goldpayloads[0].options)
        done()
      })
    })
  })

  describe('Check rounds with admin', function() {
    it('should be able to see secret data and both teams', function(done) {
      agent
      .get('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', sascAdminToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(sascAdmin)
        response.result.length.should.equal(1)

        // General =
        response.result[0].data.name.should.equal(roundName)
        response.result[0].data.blueuser.should.equal(blueCompetitor)
        response.result[0].data.golduser.should.equal(goldCompetitor)

        // Arbiter
        should.exist(response.result[0].data.arbiter)
        should.exist(response.result[0].data.arbiter.secure)
        should.exist(response.result[0].data.arbiter.public)

        // Blue
        should.exist(response.result[0].data.bluepayloads)
        response.result[0].data.bluepayloads.length.should.equal(1)
        should.exist(response.result[0].data.bluepayloads[0].options)

        // Gold
        should.exist(response.result[0].data.goldpayloads)
        response.result[0].data.goldpayloads.length.should.equal(1)
        should.exist(response.result[0].data.goldpayloads[0].options)

        done()
      })
    })
  })

  describe('Check rounds with blue competitor', function() {
    it('should be able to see public arbiter data and blue team', function(done) {
      agent
      .get('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', blueCompetitorToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(blueCompetitor)
        response.result.length.should.equal(1)

        // General =
        response.result[0].data.name.should.equal(roundName)
        response.result[0].data.blueuser.should.equal(blueCompetitor)
        response.result[0].data.golduser.should.equal(goldCompetitor)

        // Arbiter
        should.exist(response.result[0].data.arbiter)
        should.not.exist(response.result[0].data.arbiter.secure)
        should.exist(response.result[0].data.arbiter.public)

        // Blue
        should.exist(response.result[0].data.bluepayloads)
        response.result[0].data.bluepayloads.length.should.equal(1)
        should.not.exist(response.result[0].data.bluepayloads[0].options)

        // Gold
        should.not.exist(response.result[0].data.goldpayloads)

        done()
      })
    })
  })

  describe('Check rounds with gold competitor', function() {
    it('should be able to see public arbiter data and gold team', function(done) {
      agent
      .get('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', goldCompetitorToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(goldCompetitor)
        response.result.length.should.equal(1)

        // General =
        response.result[0].data.name.should.equal(roundName)
        response.result[0].data.blueuser.should.equal(blueCompetitor)
        response.result[0].data.golduser.should.equal(goldCompetitor)

        // Arbiter
        should.exist(response.result[0].data.arbiter)
        should.not.exist(response.result[0].data.arbiter.secure)
        should.exist(response.result[0].data.arbiter.public)

        // Blue
        should.not.exist(response.result[0].data.bluepayloads)

        // Gold
        should.exist(response.result[0].data.goldpayloads)
        response.result[0].data.goldpayloads.length.should.equal(1)
        should.not.exist(response.result[0].data.goldpayloads[0].options)

        done()
      })
    })
  })

  describe('Check rounds with non-competitor', function() {
    it('should be empty', function(done) {
      agent
      .get('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', notCompetitorToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(notCompetitor)
        response.result.length.should.equal(0)
        done()
      })
    })
  })

  describe('Delete round with competitor', function() {
    it('should not be authorized', function(done) {
      agent
      .delete('/sascrounds/' + roundId)
      .set('Accept', 'application/json')
      .set('authorization', goldCompetitorToken)
      .end(function(err,res) {
        res.status.should.be.equal(401)
        done()
      })
    })
  })

  describe('Delete round with admin', function() {
    it('should be successful', function(done) {
      agent
      .delete('/sascrounds/' + roundId)
      .set('Accept', 'application/json')
      .set('authorization', sascAdminToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        let response = getResponse(res)
        response.success.should.equal(true)
        done()
      })
    })
  })

  describe('Check rounds with admin', function() {
    it('should be empty again', function(done) {
      agent
      .get('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', sascAdminToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(sascAdmin)
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
