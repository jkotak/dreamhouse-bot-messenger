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
              "question":"Just to confirm, your issue is that of $1$ related to a $2$, specifically $3$, correct?",
              "optiontype":"Confirmation",
              "options":['Yes','No'],
	      "mergefields" : ['sub_type','type','description']
            },
            {
              "question":"I am sorry. I have contacted a service agent to support you",
              "optiontype":"Text",
	      "Status":"Finish"
            },
            {
              "question":"Would you like to upload any attachments?",
              "optiontype":"List",
              "options":['Yes','No']
            },
            {
              "question":"Your case has been created",
              "optiontype":"Text",
	      "Status":"Finish"
            },
            {
              "question":"OK, go ahead. I will wait",
              "optiontype":"Text"
            },
            {
              "question":"Your case has been created",
              "optiontype":"Text",
	      "Status":"Finish"
            }
		];
        
exports.deleteCase = (userid) => {
    var filter = {user_id: userid};
    return new Promise((resolve, reject) => {
        Service.deleteOne(filter,(err,deletedCase) =>{
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
            break;case "Confirmation":
	    console.log('Params:'+JSON.stringify(params, null, 4));
	    let replaced = "";
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

exports.getFieldName = (i) => {
	return caseQuestions[i].field;
}

exports.isMergeField = (i) => {
	return caseQuestions[i].mergefields===(null||undefined)?false:true;
}

exports.getMergeFieldNames = (i) =>{
	return caseQuestions[i].mergefields;
}

exports.isTheEnd=(i)=>{
	if(caseQuestions[i].Status!==(null||undefined) && caseQuestions[i].Status === "Finish"){
		return true;
	}
	return false;
}


