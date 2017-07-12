"use strict";


//var request = require('request');

const Episode7 = require('episode-7');
const jwt     = require('jsonwebtoken');
const rp      = require('request-promise');
const oAuthToken = require('./oauth-token');



function* updateToken(pvsUrl,accountId,privateKey) {

  let argumentError;
  if (pvsUrl == null) {
    argumentError = new Error('updateToken requires EINSTEIN_VISION_URL, the base API URL (first arg)');
    return Promise.reject(argumentError);
  }
  if (accountId == null) {
    argumentError = new Error('updateToken requires EINSTEIN_VISION_ACCOUNT_ID, the account ID (second arg)');
    return Promise.reject(argumentError);
  }
  if (privateKey == null) {
    argumentError = new Error('updateToken requires EINSTEIN_VISION_PRIVATE_KEY, the private key (third arg)');
    return Promise.reject(argumentError);
  }

  var reqUrl = `${pvsUrl}v1/oauth2/token`;
  
  var rsa_payload = {
    "sub":accountId,
    "aud":reqUrl
  }

  var rsa_options = {
    header:{
      "alg":"RS256",
      "typ":"JWT"
     },
     expiresIn: '25h'
  }

  var token = jwt.sign( 
    rsa_payload,
    privateKey,
    rsa_options
  );

  var options = {
    url: reqUrl,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept': 'application/json'
    },
    body:`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(token)}`
  }

  const response = yield Episode7.call(rp.post, options);
  const granted = JSON.parse(response);
  const accessToken = granted.access_token;
  oAuthToken.set(accessToken);
  return accessToken
}

module.exports = updateToken;

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
 
        
