"use strict";

var https = require('https');

exports.classify = imageURL => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("contemporary");
    }, 2000);
});

exports.address = (latitude, longitude) => {
    return new Promise(function (resolve, reject) {
        var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&sensor=true';
        var request = https.get(url, function(response){
            var body = "";
            //read the data
            response.on('data', function(chunk) {
              body += chunk;
            });
            response.on('end', function(){
                //console.log(body);
                if(response.statusCode ===200){
                    try {
                        //parse the data (read the data from a string in a program friendly way
                        var profile = JSON.parse(body);
                        //print out the data
                        response('San Francisco');     
                    } catch(error) {
                        //handling a parse error
                        reject(response.statusCode);
                    }
                } else {
                    //handling status code error
                   reject(response.statusCode);
                }
            });
          });
          //Connection Error
           reject(response.statusCode);
    });
};
