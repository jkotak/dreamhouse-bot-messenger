var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var LoanApplicationSchema = new Schema({
  amount: {type: String},
  coborrower: {type: String},
  occupancy: {type: String},
  property_type: {type: String}
});

module.exports = mongoose.model("LoanApplication", LoanApplicationSchema);
