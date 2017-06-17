"use strict";

let mongoose = require("mongoose"),
        db = mongoose.connect(process.env.MONGODB_URI),
        formatter = require('./formatter'),
        Service = require("../models/case");
        
mongoose.Promise = global.Promise;


                    
var caseQuestions = [
	    {
	      "field":"type",
              "question":"What is this issue regarding?",
              "optiontype":"List",
              "options":['New Loan','Existing Loan','Other']
            },
            {
              "field":"sub_type",
              "question":"Can you pick an option to narrow it down for me?",
              "optiontype":"DependentList",
              "options":{
              		"New Loan":[ "Change Address", "Status", "Escrow" ],
              		"Existing Loan":[ "Billing Issue", "Change Address", "Loan Payoff" ]
            		}
            },
            {
              "field":"description",
              "question":"Could you describe the issue for me?",
              "optiontype":"Text"
            },
            {
              "field":"email_address",
              "question":"What is your email address?",
              "optiontype":"Text"
            },
            {
              "question":"Just to confirm, your issue is that of %1% related to a %2%. Specifically %3%?",
              "optiontype":"Confirmation",
              "options":['Yes','No']
            },
            {
              "question":"I am sorry. I have contacted a service agent to support you",
              "optiontype":"Text"
            },
            {
              "question":"Would you like to upload any attachments?",
              "optiontype":"List",
              "options":['Yes','No']
            },
            {
              "question":"Your case has been created",
              "optiontype":"Finish"
            },
            {
              "question":"OK, go ahead. I will wait",
              "optiontype":"Text"
            },
            {
              "question":"Your case has been created",
              "optiontype":"Finish"
            }
		];
        
exports.deleteCase = (userid,update) => {
    var filter = {user_id: userid};
    return new Promise((resolve, reject) => {
        Service.findOneAndDelete(filter,(err,deletedCase) =>{
            if (err) {
                 reject("An error as occurred");
            } else {
                console.log(deletedCase.user_id);
                resolve(deletedCase);
            }
        });
    });
};


exports.updateCase = (userid,update) => {
    console.log('Update Case:'+JSON.stringify(update, null, 4));
    console.log('ID:'+ userid);
    var filter = {user_id: userid};
    var options = {upsert: true, returnNewDocument : true};
    return new Promise((resolve, reject) => {
        Service.updateOne(filter, update, options,(err,newcase) =>{
            if (err) {
                 reject("An error as occurred");
            } else {
                console.log(newcase.user_id);
                resolve(newcase);
            }
        });
    });
};

exports.findCase = (userid) => {
    var filter = {user_id: userid};
    return new Promise((resolve, reject) => {
        Service.findOne(filter,(err,newcase) =>{
            if (err) {
                 reject("An error as occurred");
            } else {
                resolve(newcase);
            }
        });
    });
};

exports.findOneAndUpdateCase = (userid,update) => {
    var query = {user_id: userid};
    var options = {upsert: true,returnNewDocument:true};
    return new Promise((resolve, reject) => {
        Service.findOneAndUpdate(query, update, options).then(function(newcase) {
	    console.log(newcase.user_id);
            resolve(newcase);
        });
    });
};

exports.createQuestion=(sender, i,utterance,params)=>{
        var optiontype =  caseQuestions[i].optiontype,
            question = caseQuestions[i].question,
            postbacks = 'createCase',
            nextQuestion = '';
        switch (optiontype) {
          case "List":
            nextQuestion = formatter.formatQuestions(question,postbacks,caseQuestions[i].options);
            break;
          case "DependentList":
            nextQuestion = formatter.formatQuestions(question,postbacks,caseQuestions[i].options[utterance]);
            break;
          case "Text":
            nextQuestion = {text: question};
            break;
          case "Finish":
            //deleteCase(sender);
            nextQuestion = {text: question};
            break;
          case "Confirmation":
	    console.log('Params:'+JSON.stringify(params, null, 4));
            var parts = question.split(/(\$\w+?\$)/g).map(function(v) {
                var replaced = v.replace(/\$/g,"");
                return params[replaced] || replaced; 
            });
            question = parts.join("");
            nextQuestion = formatter.formatQuestions(question,postbacks,caseQuestions[i].options);
            break;
          default:
            nextQuestion =  {text: `You can try answering the previous question again, however, I have asked a service agent to contact you.`};
        }
        return nextQuestion;
};

exports.getFieldName = (i) => {
	return caseQuestions[i].field;
}


