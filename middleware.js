'use strict'

const dotenv = require('dotenv');

dotenv.config()

exports.middleware = function(req, res, next){
  if (req.originalUrl === "/scripts/config.js") {
    // Read from .env
    const resp = `

      function getConfig() {
        'use strict'
         return {
         }
      }
    `
    console.log(resp);
    res.end(resp)
  }
  next();
}
