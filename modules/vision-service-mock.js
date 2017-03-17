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
                        var arrAddress = profile.address_components;
                        var itemRoute='';
                        var itemLocality='';
                        var itemCountry='';
                        var itemPc='';
                        var itemSnumber='';

                        // iterate through address_component array
                        $.each(arrAddress, function (i, address_component) {
                            console.log('address_component:'+i);

                            if (address_component.types[0] == "route"){
                                console.log(i+": route:"+address_component.long_name);
                                itemRoute = address_component.long_name;
                            }

                            if (address_component.types[0] == "locality"){
                                console.log("town:"+address_component.long_name);
                                itemLocality = address_component.long_name;
                            }

                            if (address_component.types[0] == "country"){ 
                                console.log("country:"+address_component.long_name); 
                                itemCountry = address_component.long_name;
                            }

                            if (address_component.types[0] == "postal_code_prefix"){ 
                                console.log("pc:"+address_component.long_name);  
                                itemPc = address_component.long_name;
                            }

                            if (address_component.types[0] == "street_number"){ 
                                console.log("street_number:"+address_component.long_name);  
                                itemSnumber = address_component.long_name;
                            }
                            //return false; // break the loop   
                        });
                       
                        resolve(itemLocality);
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
