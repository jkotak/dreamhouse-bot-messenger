"use strict";

var https = require('https');

exports.classify = imageURL => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("contemporary");
    }, 2000);
});

exports.address = (latitude, longitude) => {
    return new Promise(function (resolve, reject) {
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&sensor=true';
        console.log('URL: '+url);
        var request = https.get(url, function(response){
            var body = "";
            //read the data
            response.on('data', function(chunk) {
              body += chunk;
            });
            console.log('Body: '+body);
            response.on('end', function(){
                console.log('Response: '+response.statusCode);
                //console.log(body);
                if(response.statusCode ===200){
                    try {
                        //parse the data (read the data from a string in a program friendly way
                        console.log('Response: '+response);
                        var profile = JSON.parse(body);
                        //print out the data
                        for (var i = 0; i < profile[0].address_components.length; i++)
                          {
                            var addr = profile[0].address_components[i];
                            var getCity;
                            if (addr.types[0] == 'locality') 
                              resolve(addr.long_name);
                          }    
                    } catch(error) {
                        //handling a parse error
                        reject(response);
                    }
                } else {
                    //handling status code error
                   reject(response);
                }
            });
          });
    });
};
