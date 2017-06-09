var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var LoanApplicationSchema = new Schema({
  user_id: {type: String},
  amount: {type: String},
  coborrower: {type: String},
  occupancy: {type: String},
  property_type: {type: String}
});


var getLoanApplication = function(userid,update) {
    coonsole.log(userid + ' ' + update);
    var query = {user_id: userid};
    var options = {upsert: true, returnNewDocument : true};
    return new Promise((resolve, reject) => {
        UserInfo.findOneAndUpdate(query, update, options, function(err, user) {
            if (err) {
                 reject("An error as occurred");
            } else {
                resolve(user);
            }
        });
    });
};



module.exports = mongoose.model("LoanApplication", LoanApplicationSchema);

