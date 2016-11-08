'use strict'

const csgrant = require('cloudsim-grant')

function setRoutes(app) {

  /////////////////////////////////////////////////
  // Request participation
  /////////////////////////////////////////////////

  // Get pending requests to particpate
  // * Team "src-admins" gets a list of pending requests.
  // * A new user can only see if they have a pending request.
  app.get('/srcsignups',
    csgrant.authenticate,
    function (req, res) {

      // Is admin?
      let isAdmin = false
      if (req.identities.indexOf('src-admins') >= 0)
        isAdmin = true

      // Is competitor?
      let isCompetitor = false
      if (req.identities.indexOf('src-competitors') >= 0)
        isCompetitor = true

      csgrant.loadData('srcsignups', (err, d) => {
        if (err) {
          res.status(500).jsonp(error(err))
          return;
        }

        // Requests list
        let data = []
        if (d && d.data && d.data.constructor === Array)
          data = d.data

        // Request pending
        let pending = false
        if (!isAdmin && !isCompetitor && data.indexOf(req.user) >= 0)
          pending = true

        // Response
        const r = {
          success: true,
          isAdmin: isAdmin,
          isCompetitor: isCompetitor,
          pending: (isAdmin || isCompetitor) ? undefined : pending,
          pendingList: isAdmin ? data : undefined,
        }

        res.jsonp(r)
      });
    })

  // Add a request to participate in the competition.
  // This should be used by prospect competitors.
  app.post('/srcsignups',
    csgrant.authenticate,
    function (req, res) {

      // Is admin?
      if (req.identities.indexOf('src-admins') >= 0) {

        // Response
        const r = {
          success: false,
          msg: "Can't request to participate, user is SRC admin."
        }

        res.jsonp(r)
        return
      }


      // Is competitor?
      if (req.identities.indexOf('src-competitors') >= 0) {

        // Response
        const r = {
          success: false,
          msg: "Can't request to participate, user is already SRC competitor."
        }

        res.jsonp(r)
        return
      }

      csgrant.loadData('srcsignups', (err, d) => {
        if (err) {
          res.status(500).jsonp(error(err))
          return;
        }

        // Requests list
        let data = []
        if (d && d.data && d.data.constructor === Array)
          data = d.data

        if (data.indexOf(req.user) >= 0) {
          // Response
          const r = {
            success: false,
            msg: "Request to participate already pending."
          }

          res.jsonp(r)
          return
        }

        // Append this user's name to the list
        data.push(req.user)

        csgrant.saveData('srcsignups', {'data': data}, (err) => {
          if (err) {
            res.status(500).jsonp(error(err))
            return;
          }

          // Response
          const r = {
            success: true,
            pending: true
          }

          res.jsonp(r)
        })
      })
    })

  // Remove a signup request from the list.
  // * Team "src-admins" should be able to remove any request.
  // * Each user can only remove their own request.
  app.delete('/srcsignups',
    csgrant.authenticate,
    function (req, res) {

      if (!req.query.username) {
        res.status(400).jsonp({'success': false, 'error': "Missing username in query."})
        return
      }

      // Is admin?
      let isAdmin = false
      if (req.identities.indexOf('src-admins') >= 0)
        isAdmin = true

      if (!isAdmin && req.user != req.query.username) {
        res.status(401).jsonp({'success': false, 'error': 'Not authorized.'})
        return
      }

      csgrant.loadData('srcsignups', (err, d) => {
        if (err) {
          res.status(500).jsonp(error(err))
          return;
        }

        // Requests list
        let data = []
        if (d && d.data && d.data.constructor === Array)
          data = d.data

        let id = data.indexOf(req.query.username)

        if (id == -1) {

          // Response
          const r = {
            success: false,
            msg: "User [" + req.query.username + "] not in pending list."
          }

          res.jsonp(r)
          return
        }

        data.splice(id, 1)

        csgrant.saveData('srcsignups', {'data': data}, (err) => {
          if (err) {
            res.status(500).jsonp(error(err))
            return;
          }

          // Response
          const r = {
            success: true,
          }

          res.jsonp(r)
        })
      })
    })
}

exports.setRoutes = setRoutes
