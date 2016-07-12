'use strict'

const express = require('express')
const app = express()
const httpServer = require('http').Server(app)
const port = process.env.PORT || 6060

const middleware = require('./middleware')

app.use(middleware.middleware)
app.use(express.static('.tmp'))
app.use(express.static('app'))

httpServer.listen(port, function(){
  console.log('listening on *:' + port);
})
