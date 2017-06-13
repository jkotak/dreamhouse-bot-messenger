"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var LoanApplicationSchema = new Schema({
  user_id: {type: String},
  amount: {type: String},
  coborrower: {type: String},
  occupancy_type: {type: String},
  email_address: {type: String},
  phone_number: {type: String},
  amount: {type: Number},
  current_state: {type: String},
  salesforce_lead_id: {type:String},
  property_type: {type: String}
});

module.exports = mongoose.model("LoanApplication", LoanApplicationSchema);
