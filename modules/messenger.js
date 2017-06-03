"use strict";

let request = require('request'),
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
exports.setMenu = (message, recipient) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: FB_PAGE_TOKEN},
        method: 'POST',
        json: {
            "persistent_menu":[
                {
                  "locale":"default",
                  "composer_input_disabled":true,
                  "call_to_actions":[
                    {
                      "title":"My Account",
                      "type":"nested",
                      "call_to_actions":[
                        {
                          "title":"Pay Bill",
                          "type":"postback",
                          "payload":"PAYBILL_PAYLOAD"
                        },
                        {
                          "title":"My Loans",
                          "type":"postback",
                          "payload":"HISTORY_PAYLOAD"
                        },
                        {
                          "title":"Loan Status",
                          "type":"postback",
                          "payload":"CONTACT_INFO_PAYLOAD"
                        }
                      ]
                    }
                  ]
                }
              ]
       }
    }, (error, response) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
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
