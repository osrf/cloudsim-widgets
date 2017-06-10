'use strict'

const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const cors = require('cors')
const morgan = require('morgan')
const httpServer = require('http').Server(app)
const dotenv = require('dotenv')
const path = require('path')

// server module for cloudsim
const csgrant = require('cloudsim-grant')
// custom routes
const middleware = require('./middleware')
const sascrounds = require('./sasc/rounds.js')
const srcsignups = require('./src/srcsignups.js')

app.use(cors())
app.use(bodyParser.json())

// prints all requests to the terminal
app.use(morgan('combined', {
  skip: function (req) {

    // skip during tests
    if (app.get('env') === 'test')
      return true

    // skip /api stuff
    const isApi = req.originalUrl.startsWith('/api/')
    if (isApi) {
      return true
    }
    return false
  }
}))

// Redirect to HTTPS
app.use(function (req, res, next) {
    // Insecure request?
    /* istanbul ignore if */
  if (req.get('x-forwarded-proto') == 'http') {
        // Redirect to https://
    return res.redirect('https://' + req.get('host') + req.url);
  }

  next();
});

// the configuration values are set in the local .env file
// this loads the .env content and puts it in the process environment.
dotenv.load()

const dbName = 'cloudsim-widgets' + (app.get('env') === 'test'? '-test': '')
process.env.CLOUDSIM_WIDGETS_DB = process.env.CLOUDSIM_WIDGETS_DB || 'localhost'

// the port of the server
const port = process.env.PORT || 5000

// the user with write access to the initial resources
const adminUser = process.env.CLOUDSIM_ADMIN || 'admin'

// serve the app from the dist directory
let rootDir = path.join(__dirname, '/../dist')
/* istanbul ignore if  */
if (process.argv[2] === 'dev')
  rootDir = path.join(__dirname, '/../app')
app.use("/", express.static(rootDir));
app.use("/api", express.static(path.join(__dirname, '/../api')));

sascrounds.setRoutes(app);
srcsignups.setRoutes(app);

app.get('/*', function(req, res, next){

  if (req.originalUrl == '/scripts/config.js')
    return next()

  if ((req.originalUrl.match(/\//g) || []).length > 1) {
    let newRoute = req.originalUrl.substr(1)
    newRoute = "/" + newRoute.replace('/', '-')
    console.log("Tried to get [" + req.originalUrl + "], sending [" + newRoute + "]")
    res.redirect(newRoute)
    return
  }

  res.sendFile(path.join(rootDir, '/index.html'));
});

// use the middleware module to serve config.js
app.use(middleware.middleware)

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
console.log('redis database name: ' + dbName)
console.log('redis database url: ' + process.env.CLOUDSIM_WIDGETS_DB)
console.log('============================================')
console.log('\n\n')

// initial resources
const resources = [
  {
    name: 'root',
    data : {},
    permissions: [
      {
        username: adminUser,
        permissions: {
          readOnly: false
        }
      }
    ]
  },
]

csgrant.init(
  resources,
  dbName,
  process.env.CLOUDSIM_WIDGETS_DB,
  httpServer,
  (err)=> {
    if(err){
      console.log('Error loading resources: ' + err)
      process.exit(-1)
    }
    else {
      console.log('resources loaded')
      csgrant.dump()
      httpServer.listen(port, function(){
        console.log('listening on *:' + port);
      })
    }
  })


