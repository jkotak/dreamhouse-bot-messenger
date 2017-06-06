"use strict";

let messenger = require('./messenger');
const disableInput = false;

exports.createMenu = () => {
  messenger.setMenu([
  {
    title: 'My Account',
    type: 'nested',
    call_to_actions: [
      {
        title: 'Loan Status',
        type: 'postback',
        payload: 'loan_status'
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
    title: 'Show Rates',
    type: 'postback',
    payload: 'show_rates'
  }, 
  {
    title: 'Provide Feedback',
    type: 'web_url',
    url: 'http://bit.ly/2qOPctw'
  }
], disableInput);
}

