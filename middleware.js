'use strict'

const dotenv = require('dotenv');

dotenv.config()

if (!process.env.CLOUDSIM_AUTH_URL)
  throw('undefined: process.env.CLOUDSIM_AUTH_URL')
if (!process.env.CLOUDSIM_PORTAL_URL)
  throw('undefined: process.env.CLOUDSIM_PORTAL_URL')

exports.middleware = function(req, res, next){
  if (req.originalUrl === "/scripts/config.js") {
    // Read from .env
    const resp = `

      function getConfig() {
        'use strict'
         return {
           auth: "${process.env.CLOUDSIM_AUTH_URL}",
           portal: "${process.env.CLOUDSIM_PORTAL_URL}",
           sim: "${process.env.CLOUDSIM_SIM_URL}"
         }
      }
    `
    // console.log('serving config: ' + resp)
    res.end(resp)
  }
  next();
}
