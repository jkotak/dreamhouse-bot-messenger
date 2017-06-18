"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CaseSchema = new Schema({
  user_id: {type: String},
  subject: {type: String},
  description: {type: String},
  type: {type: String},
  sub_type: {type: String},
  email_address: {type: String},
  phone_number: {type: String},
  phone_number: {type: String},
  status: {type: String},
  number: {type: Number},
  current_stage: {type: Number}
});

module.exports = mongoose.model("Case", CaseSchema);
