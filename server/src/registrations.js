'use strict'

const csgrant = require('cloudsim-grant')

function setRoutes(app) {

  // Request participation

  // Get all signup requests which the user can see:
  // * CLOUDSIM_ADMIN should see all.
  // * Team "src-admins" should see all.
  // * Each competitor can only see their own request.
  app.get('/srcsignups',
    csgrant.authenticate,
    csgrant.userResources,
    function (req, res, next) {
      // we're going to filter out the non
      // srcsignups types before the next middleware.
      req.allResources = req.userResources
      req.userResources = req.allResources.filter( (obj)=>{
        if(obj.name.indexOf('srcsignup-') == 0)
          return true
        return false
      })
      next()
    },
    csgrant.allResources)

  // Remove a signup request from the list.
  // * CLOUDSIM_ADMIN should be able to remove any request.
  // * Team "src-admins" should be able to remove any request.
  // * Each competitor can only remove their own request.
  app.delete('/srcsignups/:srcsignup',
    csgrant.authenticate,
    csgrant.ownsResource(':srcsignup', false),
    function (req, res) {

      csgrant.deleteResource(req.user, req.srcsignup, (err, data) => {
        let r = {};
        if (err) {
          res.status(500).jsonp(error(err))
          return;
        }
        r.success = true;
        r.resource = req.resourceData;
        res.jsonp(r);
      })
    }
  )

  // Add a request to participate in the competition.
  // This should be used by propect competitors.
  app.post('/srcsignups',
    csgrant.authenticate,
    function (req, res) {

      csgrant.getNextResourceId('srcsignup', (err, resourceName) => {

      if (err) {
        res.status(500).jsonp(error(err))
        return
      }

      csgrant.createResource(req.user, resourceName,
          {username: req.user}, (err, data) => {

        if (err) {
          res.status(500).jsonp(error(err))
          return;
        }

        let r = {};
        r.success = true
        r.result = data
        r.id = resourceName

        // Cloudsim admin should see all requests
        let adminUsername = 'admin';
        if (process.env.CLOUDSIM_ADMIN)
          adminUsername = process.env.CLOUDSIM_ADMIN;

        csgrant.grantPermission(req.user, adminUsername, r.id, false,
            function(err) {
              if (err) {
                res.status(500).jsonp(error(err))
                return;
              }

              res.jsonp(r);
              // TODO: Share it with src-admins team.
            })
      })
    })
   })

  // srcsignup route parameter
  app.param('srcsignup', function(req, res, next, id) {
    req.srcsignup = id;
    next();
  })
}

exports.setRoutes = setRoutes
