"use strict";

/*exports.getSentiment = () => {
    request({
      url: 'https://api.someapi.com/blah/something',
      auth: {
        'bearer': accessToken
      }
    }, function(err, res) {
      console.log(res.body);
    });

}*/

const rp = require('request-promise');
var Episode7 = require('episode-7');
const updateToken = require('./update-token');
const oAuthToken = require('./oauth-token');

let loopPreventor = false;

function* querySentimentApi(
                       pvsUrl,
                       document,
                       modelId='CommunitySentiment',
                       accountId,
                       privateKey,
                       jwtToken){
  var token = jwtToken || oAuthToken.get();

  var formData = {
    modelId: modelId,
    document : document
  }
  var options = {
      url: `${pvsUrl}v2/language/sentiment`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'

      },
      formData:formData
  }
  let { body, isUnauthorized } = yield Episode7.call((options) => {
    return rp(options)
      .then( body => ({ body }) )
      .catch( error => {
        if(error.statusCode === 401) {
          return { isUnauthorized: true };
        } else {
          throw error;
        }
      })
  },options);
  
  if(!loopPreventor && isUnauthorized) {
    loopPreventor = true;
    let updatedToken = yield Episode7.call(
      updateToken,
      pvsUrl,
      accountId,
      privateKey
    );

    let sentimentApiResult = yield Episode7.call( 
      querySentimentApi,
      pvsUrl,
      resizedImgUrl,
      modelId
    );
    setTimeout(()=>{loopPreventor = false},1000);
    return sentimentApiResult;
  } else {
    return body;
  }
}

module.exports = querySentimentApi;
 
        
