"use strict";

let request = require('request'),
    util = require('util'),
    FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;

exports.send = (message, recipient) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: FB_PAGE_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipient},
            message: message
        }
    }, (error, response) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};


exports.setMenu = (buttons, disableInput) => {
    console.log(util.inspect(buttons));
    request({
        url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
        qs: { access_token: FB_PAGE_TOKEN },
        method: 'POST',
        json:{
            "get_started":{
                "payload":"GET_STARTED_PAYLOAD"
            }
        }
    }, function(error, response, body) {
        console.log(response)
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    }).then(()=>{
        request({
            url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
            qs: {access_token: FB_PAGE_TOKEN},
            method: 'POST',
            json: {
                persistent_menu:[{
                    locale:'default',
                    composer_input_disabled:disableInput,
                    call_to_actions:buttons
                }]
            }
        }, (error, response) => {
            if (error) {
                console.log('(messenger) Error sending message: ', error);
                reject(error);
            } else if (response.body.error) {
                console.log('(messenger) Error: ', response.body.error);
                reject(error);
            }
        });
    });
};

    

exports.getUserInfo = (userId) => {

    return new Promise((resolve, reject) => {

        request({
            url: `https://graph.facebook.com/v2.6/${userId}`,
            qs: {fields:"first_name,last_name,profile_pic", access_token: FB_PAGE_TOKEN},
            method: 'GET',
        }, (error, response) => {
            if (error) {
                console.log('Error sending message: ', error);
                reject(error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                resolve(JSON.parse(response.body));
            }
        });

    });
};
