// load aws sdk
var aws = require('aws-sdk');

// load aws config
// aws.config.loadFromPath('config.json');

// load AWS SES
var ses = new aws.SES({apiVersion: '2010-12-01'});

///////////////////////////////////////////////////////////
// Send email
// @param[in] keyName the key name
// @param[in] region the region where the key is located
exports.sendEmail = function () {

  // send to list
  var to = ['louise@osrfoundation.org']

  // this must relate to a verified SES account
  var from = 'louise@osrfoundation.org'

  ses.sendEmail( {
     Source: from,
     Destination: { ToAddresses: to },
     Message: {
         Subject: {
            Data: 'Message from CloudSim!'
         },
         Body: {
             Text: {
                 Data: '<b>The clouds simulate</b>',
             }
          }
     }
  }
  , function(err, data) {
      if(err) throw err
          console.log('Email sent:');
          console.log(data);
   });
};
