"use strict";


var request = require('request');

var EINSTEIN_PRIVATE_KEY = process.env.EINSTEIN_PRIVATE_KEY,
    EINSTEIN_USERNAME = process.env.EINSTEIN_USERNAME,
    EINSTEIN_URL = process.env.EINSTEIN_URL


/*xports.getToken = () => {
    request({
      url: 'https://api.einstein.ai/v1/oauth2/token',
      method: 'POST',
      auth: {
        user: EINSTEIN_USERNAME,
        pass: 'yyy'
      },
      form: {
        'grant_type': 'client_credentials'
      }
    }, function(err, res) {
      var json = JSON.parse(res.body);
      console.log("Access Token:", json.access_token);
    });
};*/

exports.getSentiment = () => {
    request({
      url: 'https://api.someapi.com/blah/something',
      auth: {
        'bearer': accessToken
      }
    }, function(err, res) {
      console.log(res.body);
    });

}
 
        
