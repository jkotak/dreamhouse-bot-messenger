var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserInfoSchema = new Schema({
  user_id: {type: String},
  email: {type: Email},
  phone: {type: String},
  last_keyword:{type:String}
});

module.exports = mongoose.model("UserInfo", UserInfoSchema);
