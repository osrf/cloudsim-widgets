'use strict'

const express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require("body-parser")
const cors = require('cors')
const morgan = require('morgan')
const util = require('util')
const httpServer = require('http').Server(app)
const dotenv = require('dotenv')
const path = require('path')

// server module for cloudsim
const csgrant = require('cloudsim-grant')
// custom routes
const middleware = require('./middleware')

app.use(cors())
app.use(bodyParser.json())

// prints all requests to the terminal
app.use(morgan('combined'))


// the configuration values are set in the local .env file
// this loads the .env content and puts it in the process environment.
dotenv.load()

const dbName = 'cloudsim-widgets' + (app.get('env') === 'test'? '-test': '')

// the port of the server
const port = process.env.PORT || 4000

// the user with write access to the initial resources
const adminUser = process.env.CLOUDSIM_ADMIN || 'admin'

// we create 2 initial resources
csgrant.init(adminUser, {'src_registrations': {},
                         'ariac_registrations': {}
                        },
                        dbName,
                        (err)=> {
  if(err){
    console.log('Error loading resources: ' + err)
    process.exit(-1)
  }
  else {
    console.log('resources loaded')
    csgrant.dump()
  }
})

// serve the app from the dist directory
const rootDir = path.join(__dirname, '/../dist')
app.use("/", express.static(rootDir));

// setup the routes
app.get('/permissions',
  csgrant.authenticate,
  csgrant.userResources,
  csgrant.allResources)
app.post('/permissions', csgrant.authenticate, csgrant.grant)
app.delete('/permissions',csgrant.authenticate, csgrant.revoke)

// use the middleware module to serve config.js
app.use(middleware.middleware)

// set up the routes here for different resources
// machinetypes.setRoutes(app)

// Expose app
exports = module.exports = app

console.log('\n\n')
console.log('============================================')
console.log('cloudsim-widgets version: ', require('../package.json').version)
console.log('server: ', __filename)
console.log('port: ' + port)
console.log('cloudsim-grant version: ', require('cloudsim-grant/package.json').version)
console.log('admin user: ' + adminUser)
console.log('environment: ' + app.get('env'), process.env.NODE_ENV)
console.log('redis database: ' + dbName)
console.log('============================================')
console.log('\n\n')

httpServer.listen(port, function(){
	console.log('listening on *:' + port);
})
