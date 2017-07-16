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
        title: 'Next Payment',
        type: 'postback',
        payload: 'next_payment'
      },
      {
        title: 'Contact Support',
        type: 'postback',
        payload: 'contact_support'
      }
    ]
  },
  {
    title: 'Rates',
    type: 'nested',
    call_to_actions: [
      {
        title: 'Conventional Fixed-Rate',
        type: 'postback',
        payload: 'show_rates,Conventional Fixed-Rate Mortgages'
      },
      {
        title: 'Adjustable-Rate',
        type: 'postback',
        payload: 'show_rates,Adjustable-Rate Mortgages (ARMs)'
      },
      {
        title: 'FHA',
        type: 'postback',
        payload: 'show_rates,FHA Mortgages'
      }
    ]
  },
  {
    title: 'Provide Feedback',
    type: 'web_url',
    url: 'http://bit.ly/2qOPctw'
  }
], disableInput);
}

