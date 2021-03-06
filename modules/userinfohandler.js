"use strict";

let mongoose = require("mongoose"),
        db = mongoose.connect(process.env.MONGODB_URI),
        formatter = require('./formatter'),
        UserInfo = require("../models/userinfo");
        
mongoose.Promise = global.Promise;

exports.getUserHistory = (userid) => {
    var query = {user_id: userid};
    return new Promise((resolve, reject) => {
        UserInfo.findOne(query, function(err, user) {
            if (err) {
                 reject("An error as occurred");
            } else {
                resolve(user);
            }
        });
    });
};

exports.getSetUserHistory  = (userid,handler) => {
    var query = {user_id: userid};
    var update = {
                    user_id: userid,
                    last_keyword:handler
                };
    var options = {upsert: true, returnNewDocument : true};
    return new Promise((resolve, reject) => {
        UserInfo.findOneAndUpdate(query, update, options, (err, user) => {
            if (err) {
                 reject("An error as occurred");
            } else {
                resolve(user);
            }
        });
    });
};

exports.updateUserInfo = (userid,update) => {
    var query = {user_id: userid};
    var options = {upsert: true};
    return new Promise((resolve, reject) => {
        UserInfo.updateOne(query, update, options,(err,user)=> {
            if (err) {
                 reject("An error as occurred");
            } else {
                resolve(user);
            }
        });
    });
};

exports.findOneAndUpdateUserInfo = (userid,update) => {
    var query = {user_id: userid};
    var options = {upsert: true,returnNewDocument:true};
    return new Promise((resolve, reject) => {
        UserInfo.findOneAndUpdate(query, update, options,(err,user)=> {
            if (err) {
                 reject("An error as occurred");
            } else {
                resolve(user);
            }
        });
    });
};

exports.findUserHistoryWithProjections = (userid,projections) => {
    var filter = {user_id: userid};
    return new Promise((resolve, reject) => {
        UserInfo.findOne(filter,projections,(err,user) =>{
            if (err) {
                 reject("An error as occurred");
            } else {
                console.log(user.user_id);
                resolve(user);
            }
        });
    });
};


