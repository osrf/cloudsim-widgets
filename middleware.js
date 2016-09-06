'use strict'

const dotenv = require('dotenv');

dotenv.config()

// Required environment variables
if (!process.env.CLOUDSIM_AUTH_URL)
  throw('undefined: process.env.CLOUDSIM_AUTH_URL')
if (!process.env.CLOUDSIM_PORTAL_URL)
  throw('undefined: process.env.CLOUDSIM_PORTAL_URL')
if (!process.env.AUTH0_CLIENT_ID)
  throw('undefined: process.env.AUTH0_CLIENT_ID')
if (!process.env.AUTH0_DOMAIN)
  throw('undefined: process.env.AUTH0_DOMAIN')
if (!process.env.CLOUDSIM_ADMIN)
  throw('undefined: process.env.CLOUDSIM_ADMIN')

exports.middleware = function(req, res, next){
  if (req.originalUrl === "/scripts/config.js") {
    // Read from .env
    const resp = `

      function getConfig() {
        'use strict'
         return {
           auth: "${process.env.CLOUDSIM_AUTH_URL}",
           portal: "${process.env.CLOUDSIM_PORTAL_URL}",
           sim: "${process.env.CLOUDSIM_SIM_URL}",
           auth0_id: "${process.env.AUTH0_CLIENT_ID}",
           auth0_domain: "${process.env.AUTH0_DOMAIN}",
           admin: "${process.env.CLOUDSIM_ADMIN}",
           src_competitor: "${process.env.SRC_COMPETITOR}",
           src_admin: "${process.env.SRC_ADMIN}",
           ariac_competitor: "${process.env.ARIAC_COMPETITOR}",
           ariac_admin: "${process.env.ARIAC_ADMIN}",
         }
      }
    `
    console.log('serving config: ' + resp)
    res.end(resp)
  }
  next();
}
