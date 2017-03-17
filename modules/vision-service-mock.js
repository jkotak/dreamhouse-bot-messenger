"use strict";

var geocoder = require('geocoder');

exports.classify = imageURL => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("contemporary");
    }, 2000);
});

exports.address = (latitude, longitude) => {
    return new Promise(function (resolve, reject) {
      geocoder.reverseGeocode( 33.7489, -84.3789, function ( err, data ) {
        });
    });
};
