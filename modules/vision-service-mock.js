"use strict";

var cities = require("cities")

exports.classify = imageURL => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("contemporary");
    }, 2000);
});

exports.address = (latitude, longitude) => {
    return new Promise(function (resolve, reject) {
       cities.gps_lookup(37.790293414181, 37.790293414181);
    });
};
