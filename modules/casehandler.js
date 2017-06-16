"use strict";

let mongoose = require("mongoose"),
        db = mongoose.connect(process.env.MONGODB_URI),
        formatter = require('./formatter'),
        Service = require("../models/case");
        
mongoose.Promise = global.Promise;


                    
var caseQuestions = [
	    {
              "question":"What is this issue regarding?",
              "optiontype":"List",
              "options":['New Loan','Existing Loan','Other']
            },
            {
              "question":"Can you pick an option to narrow it down for me?",
              "optiontype":"DependentList",
              "options":{
              		"New Loan":[ "Change Address", "Status", "Escrow" ],
              		"Existing Loan":[ "Billing Issue", "Change Address", "Loan Payoff" ]
            		}
            },
            {
              "question":"Could you describe the issue for me?",
              "optiontype":"Text"
            },
            {
              "question":"What is your emmail address?",
              "optiontype":"Text"
            },
            {
              "question":"Just to confirm, your issue is that of %1% related to a %2%. Specifically %3%?",
              "optiontype":"confirmation",
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
              "question":"Your case has been create",
              "optiontype":"Finish"
            },
            {
              "question":"OK, go ahead. I will wait",
              "optiontype":"Text"
            }
		];
        


/*
exports.updateCase = (userid,update) => {
    var filter = {user_id: userid};
    var options = {upsert: true, returnNewDocument : true};
    return new Promise((resolve, reject) => {
        Service.updateOne(filter, update,(err,newcase) =>{
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
                console.log(newcase.user_id);
                resolve(newcase);
            }
        });
    });
};
*/
exports.findOneAndUpdateCase = (userid,update) => {
    var query = {user_id: userid};
    var options = {upsert: true,returnNewDocument:true};
    return new Promise((resolve, reject) => {
        Service.findOneAndUpdate(query, update, options).then((err,newcase)=> {
            if (err) {
                 reject("An error as occurred");
            } else {
                resolve(newcase);
            }
        });
    });
};

exports.createQuestion=(i,utterance,params)=>{
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
            //cleanup
            nextQuestion = {text: question};
            break;
          case "Confirmation":
            var parts = question.split(/(\$\w+?\$)/g).map(function(v) {
                replaced = v.replace(/\$/g,"");
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





