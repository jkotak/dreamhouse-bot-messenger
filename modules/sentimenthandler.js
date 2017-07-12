"use strict";




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
 
        
