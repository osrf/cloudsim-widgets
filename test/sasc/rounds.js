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

// Types of users for testing:
// * super admin (TODO: pending csgrant upgrade)
// * game master
// * competitor
// * other cloudsim users

const cloudsimAdmin = process.env.CLOUDSIM_ADMIN ?
    process.env.CLOUDSIM_ADMIN:'cloudsimAdmin'
const cloudsimAdminTokenData = {identities: [cloudsimAdmin]}
let cloudsimAdminToken

const gameMaster = "gamemaster"
const gameMasterTokenData = {identities: [gameMaster, "sasc-gamemasters"]}
let gameMasterToken

const gameMaster2 = "gamemaster2"
const gameMaster2TokenData = {identities: [gameMaster2, "sasc-gamemasters"]}
let gameMaster2Token

const competitor1 = "competitor1"
const competitor1TokenData = {identities: [competitor1, "sasc-competitors"]}
let competitor1Token

const competitor2 = "competitor2"
const competitor2TokenData = {identities: [competitor2, "sasc-competitors"]}
let competitor2Token

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

    csgrant.token.signToken(gameMasterTokenData, (e, tok)=>{
      if(e) {
        console.log('sign error: ' + e)
      }
      gameMasterToken = tok
      csgrant.token.signToken(gameMaster2TokenData, (e, tok)=>{
        if(e) {
          console.log('sign error: ' + e)
        }
        gameMaster2Token = tok
        csgrant.token.signToken(competitor1TokenData, (e, tok)=>{
          if(e) {
            console.log('sign error: ' + e)
          }
          competitor1Token = tok
          csgrant.token.signToken(competitor2TokenData, (e, tok)=>{
            if(e) {
              console.log('sign error: ' + e)
            }
            competitor2Token = tok
            csgrant.token.signToken(notCompetitorTokenData, (e, tok)=>{
              if(e) {
                console.log('sign error: ' + e)
              }
              notCompetitorToken = tok

              // Share root resource
              csgrant.grantPermission(cloudsimAdmin, "sasc-gamemasters",
                  "sascrounds", false, function(err) {
                    if (err) {
                      return cb(err)
                    }
                    done()
                  })
            })
          })
        })
      })
    })
  })

  describe('Check initial rounds with a gamemaster', function() {
    it('should be empty', function(done) {
      agent
      .get('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', gameMasterToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(gameMaster)
        response.result.length.should.equal(0)
        done()
      })
    })
  })

  describe('Check initial rounds with a competitor', function() {
    it('should be empty', function(done) {
      agent
      .get('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', competitor1Token)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(competitor1)
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
      .set('authorization', competitor1Token)
      .end(function(err,res) {
        res.status.should.be.equal(401)
        done()
      })
    })
  })

  describe('Start a new round with game master, missing fields', function() {
    it('should return a bad request error', function(done) {
      agent
      .post('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', gameMasterToken)
      .end(function(err,res) {
        res.status.should.be.equal(400)
        done()
      })
    })
  })

  let roundName = 'Test round'
  describe('Start a new round with game master', function() {
    it('should create a resource with the correct permissions', function(done) {
      agent
      .post('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', gameMasterToken)
      .send({'name': roundName, 'blueuser': competitor1, 'golduser': competitor2})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        let response = getResponse(res)
        response.success.should.equal(true)

        // Input data
        response.result.data.name.should.equal(roundName)
        response.result.data.blueuser.should.equal(competitor1)
        response.result.data.golduser.should.equal(competitor2)

        // Permissions
        response.result.permissions[gameMaster].readOnly.should.equal(false)
        response.result.permissions['sasc-admins'].readOnly.should.equal(false)
        response.result.permissions[competitor1].readOnly.should.equal(true)
        response.result.permissions[competitor2].readOnly.should.equal(true)
        done()
      })
    })
  })
/*
  let roundId
  describe('Get rounds with admin', function() {
    it('should have one round', function(done) {
      agent
      .get('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', gameMasterToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(gameMaster)
        response.result.length.should.equal(1)

        // Round data
        roundId = response.result[0].name
        roundId.indexOf('sascround').should.be.above(-1)

        response.result[0].data.name.should.equal(roundName)
        response.result[0].data.blueuser.should.equal(competitor1)
        response.result[0].data.golduser.should.equal(competitor2)

        // Permissions
        response.result[0].permissions.length.should.equal(4)
        response.result[0].permissions[0].username.should.equal(gameMaster)
        response.result[0].permissions[0].permissions.readOnly.should.equal(false)
        response.result[0].permissions[1].username.should.equal('sasc-admins')
        response.result[0].permissions[1].permissions.readOnly.should.equal(false)
        response.result[0].permissions[2].username.should.equal(competitor1)
        response.result[0].permissions[2].permissions.readOnly.should.equal(true)
        response.result[0].permissions[3].username.should.equal(competitor2)
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
      .set('authorization', competitor1Token)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(competitor1)
        response.result.length.should.equal(1)

        // Round data
        response.result[0].name.should.equal(roundId)
        response.result[0].data.name.should.equal(roundName)
        response.result[0].data.blueuser.should.equal(competitor1)
        response.result[0].data.golduser.should.equal(competitor2)

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
      .set('authorization', competitor1Token)
      .end(function(err,res) {
        res.status.should.be.equal(401)
        done()
      })
    })
  })

  describe('Add arbiter data to round with another admin', function() {
    it('should append data', function(done) {
      agent
      .put('/sascrounds/' + roundId)
      .set('Accept', 'application/json')
      .set('authorization', gameMaster2Token)
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
        response.result.data.blueuser.should.equal(competitor1)
        response.result.data.golduser.should.equal(competitor2)

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
      .set('authorization', gameMasterToken)
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
        response.result.data.blueuser.should.equal(competitor1)
        response.result.data.golduser.should.equal(competitor2)
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
      .set('authorization', gameMasterToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(gameMaster)
        response.result.length.should.equal(1)

        // General =
        response.result[0].data.name.should.equal(roundName)
        response.result[0].data.blueuser.should.equal(competitor1)
        response.result[0].data.golduser.should.equal(competitor2)

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
      .set('authorization', competitor1Token)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(competitor1)
        response.result.length.should.equal(1)

        // General =
        response.result[0].data.name.should.equal(roundName)
        response.result[0].data.blueuser.should.equal(competitor1)
        response.result[0].data.golduser.should.equal(competitor2)

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
      .set('authorization', competitor2Token)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(competitor2)
        response.result.length.should.equal(1)

        // General =
        response.result[0].data.name.should.equal(roundName)
        response.result[0].data.blueuser.should.equal(competitor1)
        response.result[0].data.golduser.should.equal(competitor2)

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
      .set('authorization', competitor2Token)
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
      .set('authorization', gameMasterToken)
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
      .set('authorization', gameMasterToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        let response = getResponse(res)
        response.success.should.equal(true)
        response.requester.should.equal(gameMaster)
        response.result.length.should.equal(0)
        done()
      })
    })
  })

  let roundId2
  describe('Start round where two admins are competitors', function() {
    it('should create a resource with the correct permissions', function(done) {
      agent
      .post('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', gameMasterToken)
      .send({'name': roundName, 'blueuser': gameMaster, 'golduser': gameMaster2})
      .end(function(err,res) {
        res.status.should.be.equal(200)
        let response = getResponse(res, true)
        response.success.should.equal(true)

        roundId2 = response.id
        roundId2.indexOf('sascround').should.be.equal(0)

        // Input data
        response.result.data.name.should.equal(roundName)
        response.result.data.blueuser.should.equal(gameMaster)
        response.result.data.golduser.should.equal(gameMaster2)

        // Permissions
        response.result.permissions[gameMaster].readOnly.should.equal(false)
        response.result.permissions['sasc-admins'].readOnly.should.equal(false)

        // 2nd admin's personal permission is read only, but they have write
        // from the sasc-admins group
        response.result.permissions[gameMaster2].readOnly.should.equal(true)

        done()
      })
    })
  })

  describe('Add secure data to round with admin who created it', function() {
    it('should append data', function(done) {
      agent
      .put('/sascrounds/' + roundId2)
      .set('Accept', 'application/json')
      .set('authorization', gameMaster2Token)
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
        should.exist(response.result.data.arbiter.secure)
        done()
      })
    })
  })

  describe('Get round with admin who created it', function() {
    it('should have secure data', function(done) {
      agent
      .get('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', gameMasterToken)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        let response = getResponse(res, true)
        response.success.should.equal(true)
        response.requester.should.equal(gameMaster)
        response.result.length.should.equal(1)
        should.exist(response.result[0].data.arbiter.secure)
        done()
      })
    })
  })

  describe('Get round with admin who is competitor', function() {
    it('should have secure data', function(done) {
      agent
      .get('/sascrounds')
      .set('Accept', 'application/json')
      .set('authorization', gameMaster2Token)
      .end(function(err,res) {
        res.status.should.be.equal(200)
        let response = getResponse(res, true)
        response.success.should.equal(true)
        response.requester.should.equal(gameMaster2)
        response.result.length.should.equal(1)
        should.exist(response.result[0].data.arbiter.secure)
        done()
      })
    })
  })
*/
  after(function(done) {
    console.log('after everything')
    csgrant.model.clearDb()
    done()
  })

})
