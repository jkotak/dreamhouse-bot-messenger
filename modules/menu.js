"use strict";

let messenger = require('./messenger');
const disableInput = false;



exports.setPersistentMenu([
  {
    title: 'My Account',
    type: 'nested',
    call_to_actions: [
      {
        title: 'Pay Bill',
        type: 'postback',
        payload: 'PAYBILL_PAYLOAD'
      },
      {
        title: 'History',
        type: 'postback',
        payload: 'HISTORY_PAYLOAD'
      },
      {
        title: 'Contact Info',
        type: 'postback',
        payload: 'CONTACT_INFO_PAYLOAD'
      }
    ]
  },
  {
    title: 'Go to Website',
    type: 'web_url',
    url: 'http://purple.com'
  }
], disableInput);
