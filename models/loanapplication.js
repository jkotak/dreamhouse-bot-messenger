var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var LoanApplicationSchema = new Schema({
  user_id: {type: String},
  email: {type: String},
  phone: {type: String},
  amount: {type: String},
  coborrower: {type: String},
  occupancy: {type: String},
  property_type: {type: String}
});

module.exports = mongoose.model("LoanApp", LoanApplicationSchema);
