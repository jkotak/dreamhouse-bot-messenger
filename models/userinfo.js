var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserInfoSchema = new Schema({
  user_id: {type: String},
  email_address: {type: String},
  phone_number: {type: String},
  last_keyword:{type:String},
  stop_bot:{type:Boolean}
});

module.exports = mongoose.model("UserInfo", UserInfoSchema);
