'use strict'

const csgrant = require('cloudsim-grant')

function setRoutes(app) {

  // delete a srcregistration
  app.delete('/srcregistrations/:srcregistration',
    csgrant.authenticate,
    csgrant.ownsResource(':srcregistration', false),
    function (req, res) {

      csgrant.deleteResource(req.user, req.srcregistration, (err, data) => {
        let r = {};
        if (err) {
          r.success = false;
        }
        else {
          r.success = true;
        }
        r.resource = req.resourceData;
        res.jsonp(r);
      })

    }
  )

  // Get all registrations which the user can see
  app.get('/srcregistrations',
    csgrant.authenticate,
    csgrant.userResources,
    function (req, res, next) {
      // we're going to filter out the non
      // srcregistrations types before the next middleware.
      req.allResources = req.userResources
      req.userResources = req.allResources.filter( (obj)=>{
        if(obj.name.indexOf('srcregistration-') == 0)
          return true
        return false
      })
      next()
    },
    csgrant.allResources)

  // Create a registration
  app.post('/srcregistrations',
    csgrant.authenticate,
    function (req, res) {

      csgrant.getNextResourceId('srcregistration', (err, resourceName) => {

      if (err) {
        res.status(500).jsonp(error(err))
        return
      }

      csgrant.createResource(req.user, resourceName,
          {username: req.user}, (err, data) => {

        let r = {};
        if (err) {
          res.status(500).jsonp(error(err))
          return;
        }

        r.success = true
        r.result = data
        r.id = resourceName

        // TODO: Share it with cloudsim admin and src-admins team.
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
            })
      })
    })
   })

  // srcregistration route parameter
  app.param('srcregistration', function( req, res, next, id) {
    req.srcregistration = id
    next()
  })
}

exports.setRoutes = setRoutes
