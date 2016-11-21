'use strict'

const csgrant = require('cloudsim-grant')

function setRoutes(app) {

  // Get all rounds for a user
  app.get('/sascrounds',
    csgrant.authenticate,
    csgrant.userResources,
    function(req, res, next) {

      // Filter
      req.allResources = req.userResources
      req.userResources = req.allResources.filter( (obj)=>{

        // Must be sascround
        if(obj.name.indexOf('sascround-') != 0)
          return false


        // If user has write permission, they are an admin, so they can see
        // the whole data
        if (!obj.permissions[0].permissions.readOnly)
          return true

        // For competitors, filter out information about arbiter and opposing
        // team

        let isBlue = (obj.data.blueuser == req.user)
        let isGold = (obj.data.golduser == req.user)

        if (!isBlue && !isGold) {
          console.error("Not admin, blue or gold, how does user [" + req.user +
              "] have any access to round [" + obj.name + "]?!")
          return false
        }

        obj.permissions = undefined
        obj.data.arbiter = undefined

        if (isBlue) {
          obj.data.goldpayloads = undefined
        }

        if (isGold) {
          obj.data.bluepayloads = undefined
        }

        return true
      })

      next()
    },
    csgrant.allResources)

  // Start a new round
  app.post('/sascrounds',
    csgrant.authenticate,
    function(req, res) {

      let isAdmin = false
      if (req.identities.indexOf('sasc-admins') >= 0)
        isAdmin = true

      if (!isAdmin) {
        res.status(401).jsonp('{"error":"Only SASC admins can start rounds."}')
        return
      }

      const resourceData = req.body

      // Check data is complete
      if (resourceData.name == undefined || resourceData.name == "" ||
          resourceData.blueuser == undefined || resourceData.blueuser == "" ||
          resourceData.golduser == undefined || resourceData.golduser == "") {

        res.status(400).jsonp('{"error":"Missing required field."}')
        return
      }

      const operation = 'Start SASC round'

      const user = req.user
      csgrant.createResourceWithType(user, 'sascround', resourceData, (err, data, resourceName) => {
        if(err) {
          let error = {
            operation: operation,
            success: false,
            error: err
          }
          res.status(500).jsonp(error)
          return
        }
        const r = {
          success: true,
          operation: operation,
          result: data,
          id: resourceName
        }

        // Give all admins write access
        csgrant.grantPermission(req.user, "sasc-admins", r.id, false,
          function(err) {
            if (err) {
              res.status(500).jsonp(error(err))
              return;
            }

            // Give competitors read access

            // Blue
            csgrant.grantPermission(req.user, resourceData.blueuser, r.id, true,
              function(err) {
                if (err) {
                  res.status(500).jsonp(error(err))
                  return;
                }

                // Gold
                csgrant.grantPermission(req.user, resourceData.golduser, r.id, true,
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
    })

  // Finish a round
  // Only competition admins (write access) can do it.
  app.delete('/sascrounds/:sascround',
    csgrant.authenticate,
    csgrant.ownsResource(':sascround', false),
    function(req, res) {
      const resource = req.sascround
      csgrant.deleteResource(req.user, resource, (err, data) => {
        if(err) {
          return res.status(500).jsonp({success: false, error: err})
        }
        let r = {
          success: true,
          result: data
        }
        res.jsonp(r)
      })
    })

  // Update information about a round
  app.put('/sascrounds/:sascround',
    csgrant.authenticate,
    csgrant.ownsResource(':sascround', false),
    function(req, res) {

      const resourceName = req.sascround
      const newData = req.body

      csgrant.readResource(req.user, resourceName, function(err, oldData) {
        if(err) {
          return res.status(500).jsonp({success: false,
            error: 'error trying to read existing data: ' + err})
        }

        const futureData = oldData.data

        // merge with existing fields of the newData, keeping old fields intact
        for (var attrname in newData) {
          if (newData[attrname] == "")
            continue

          futureData[attrname] = newData[attrname]
        }
        csgrant.updateResource(req.user, resourceName, futureData, (err, data) => {
          if(err) {
            return res.status(500).jsonp({success: false, error: err})
          }
          const r = {
            success: true,
            result: data,
          }
          res.jsonp(r)
        })
      })
    })

  // sascround route parameter
  app.param('sascround', function(req, res, next, id) {
    req.sascround = id
    next()
  })
}

exports.setRoutes = setRoutes
