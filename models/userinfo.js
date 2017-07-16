var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserInfoSchema = new Schema({
  user_id: {type: String},
  salesforce_id: {type: String},
  email_address: {type: String},
  phone_number: {type: String},
  last_keyword:{type:String},
  stop_bot:{type:Boolean},
  first_name: {type: String},
  last_name:{type:String}
});

module.exports = mongoose.model("UserInfo", UserInfoSchema);
