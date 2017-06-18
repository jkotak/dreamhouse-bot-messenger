"use strict";

let salesforce = require('./salesforce'),
    messenger = require('./messenger'),
    formatter = require('./formatter'),
    loanapplicationhandler = require('./loanapplicationhandler'),
    userinfohandler = require('./userinfohandler'),
    casehandler = require('./casehandler');

let userid = null;

exports.searchHouse = (sender) => {
    messenger.send(formatter.requestLocation(), sender);
};

exports.searchProducts = (sender) => {
    messenger.send({text: `OK, looking for rates...`}, sender);
    salesforce.findAllRateTypes().then(rateTypes => {
        messenger.send(formatter.formatProductOptions (rateTypes), sender);
    });
};



exports.searchHouse_City = (sender, values) => {
    messenger.send({text: `OK, looking for houses in ${values[1]}`}, sender);
    salesforce.findProperties({city: values[1]}).then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.searchHouse_Bedrooms_City_Range = (sender, values) => {
    messenger.send({text: `OK, looking for ${values[1]} bedrooms in ${values[2]} between ${values[3]} and ${values[4]}`}, sender);
    salesforce.findProperties({bedrooms: values[1], city: values[2]}).then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.searchHouse_Bedrooms_City = (sender, values) => {
    messenger.send({text: `OK, looking for ${values[1]} bedroom houses in ${values[2]}`}, sender);
    salesforce.findProperties({bedrooms: values[1], city: values[2]}).then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.searchHouse_Bedrooms = (sender, values) => {
    messenger.send({text: `OK, looking for ${values[1]} bedrooms`}, sender);
    salesforce.findProperties({bedrooms: values[1]}).then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.searchHouse_Range = (sender, values) => {
    messenger.send({text: `OK, looking for houses between ${values[1]} and ${values[2]}`}, sender);
    salesforce.findProperties({priceMin: values[1], priceMax: values[2]}).then(properties => {
        messenger.send(formatter.formatProperties(properties), sender);
    });
};

exports.priceChanges = (sender, values) => {
    messenger.send({text: `OK, looking for recent price changes...`}, sender);
    salesforce.findPriceChanges().then(priceChanges => {
        messenger.send(formatter.formatPriceChanges(priceChanges), sender);
    });
};

exports.agent = (sender) => {
    messenger.send(formatter.formatTransferAgent(), sender);
};

exports.loanStatus = (sender) => {
    messenger.send(formatter.formatLoanAccountLinking(), sender);
};

exports.hi = (sender) => {
    messenger.getUserInfo(sender).then(response => {
        messenger.send({text: `Hello, ${response.first_name}! Welcome to Cumulus Mortgage Demo.`}, sender);
    });
};

exports.thankYou = (sender) => {
    messenger.getUserInfo(sender).then(response => {
        messenger.send({text: `You're welcome, ${response.first_name}! I am happy to help. You could also provide feedback to my creator at http://bit.ly/2qOPctw`}, sender);
    });
};

exports.wakeup = (sender) => {
    var update = {
      'stop_bot':false
    }; 
    userinfohandler.updateUserInfo(sender,update).then(user => {
        messenger.getUserInfo(sender).then(response => {
            messenger.send({text: `Hello, ${response.first_name}! I am back. How can I help you?`}, sender);
        });
    });
};
exports.authenticated =(sender,userid)=>{
    messenger.getUserInfo(sender).then(response => {
        messenger.send({text: `${response.first_name}, you are now authenticated. Let me check on that loan status for you...`}, sender).then(()=>{
            salesforce.getLoanStatus(userid).then(loans => {
                messenger.send(formatter.formatLoans(loans), sender);
            });
        });
    });
}

exports.startCase = (sender,params) =>{
    casehandler.findCase(sender).then(thiscase => {
        var current_stage = 0;
        var update = {};
        var moreparams = {};
        if(thiscase!==null){
           let fieldName = casehandler.getFieldName(thiscase.current_stage);
           if(fieldName!=null && fieldName!=undefined){
                update[casehandler.getFieldName(thiscase.current_stage)]=params[0];
           }
           update["current_stage"]=thiscase.current_stage+1;
           current_stage = thiscase.current_stage+1;
           if(params[0]==='Yes'){
                update["current_stage"]=thiscase.current_stage+2;
                current_stage = thiscase.current_stage+2;
           }
           if(current_stage==4){
               moreparams["1"]=thiscase[casehandler.getFieldName(1)];
               moreparams["2"]=thiscase[casehandler.getFieldName(0)];
               moreparams["3"]=thiscase[casehandler.getFieldName(2)];
           }
        }else{
           update["current_stage"]=0;
        }
        if(casehandler.isTheEnd(current_stage)){
            casehandler.deleteCase (sender).then(thiscase => { 
                messenger.send(casehandler.createQuestion(sender,current_stage,params[0],moreparams), sender).then(() => {
                  userinfohandler.getSetUserHistory(sender,"help");
                })
            });
        }else{
            casehandler.updateCase(sender,update).then(thiscase => { 
                messenger.send(casehandler.createQuestion(sender,current_stage,params[0],moreparams), sender);
            }).catch(function(e){
                messenger.send({text: `Humm...that was not a valid option.`}, sender);
            });
        }
     });
}

exports.startApplication = (sender,params) =>{
    console.log(params)
    
    
    switch (params[1]) {
        case "askSecondQuestion":
            console.log('Params[3]:'+params[3]);
            var update = {
              'occupancy_type': params[3],
              'current_state':params[1]
            }; 
            loanapplicationhandler.updateLoanApp(sender,update).then(application => {
                messenger.send(loanapplicationhandler.createSecondQuestion(), sender);
            });
            break;
        case "askThirdQuestion":
            console.log('Params[3]:'+params[3]);
            var update = {
              'property_type': params[3],
              'current_state':params[1]
            }; 
            loanapplicationhandler.updateLoanApp(sender,update).then(application => {
                messenger.send(loanapplicationhandler.createThirdQuestion(), sender);
            });
            break;
        case "askFourthQuestion":
            console.log('Params[3]:'+params[3]);
            var update = {
              'amount': params[3],
              'current_state':params[1]
            }; 
            loanapplicationhandler.updateLoanApp(sender,update).then(application => {
                messenger.send(loanapplicationhandler.createFourthQuestion(), sender);
            });
            break;
        case "askFifthQuestion":
            console.log('Params[3]:'+params[3]);
            var update = {
              'email_address': params[3],
              'current_state':params[1]
            }; 
            loanapplicationhandler.updateLoanApp(sender,update).then(application => {
                messenger.send(loanapplicationhandler.createFifthQuestion(), sender);
            });
            break;
         case "askSixthQuestion":
            var update = {
              'phone_number': params[3],
              'current_state':params[1]
            }; 
            loanapplicationhandler.updateLoanApp(sender,update).then(application => {
                loanapplicationhandler.findLoanApp(sender).then(loanApp => {
                    messenger.send(loanapplicationhandler.createSixthQuestion(loanApp), sender);
                });
            });
            break;
         case "processLoanApplication":
            if('No'===params[3]){
                messenger.send(loanapplicationhandler.error(), sender);
            }else{
                messenger.setTyping ('typing_on', sender);
                loanapplicationhandler.findLoanApp(sender).then(loanApp => {
                    messenger.getUserInfo(sender).then(response => {
                        salesforce.createLeadApp(response.first_name, response.last_name,loanApp.phone_number, loanApp.email_address, loanApp.amount,sender).then((salesforceLead)=>{
                            loanapplicationhandler.updateLoanApp(sender,{'salesforce_lead_id':salesforceLead.id}).then(loanApp => {
                                messenger.send(loanapplicationhandler.createExceptionDocs(), sender);
                            });
                            
                        });
                    });
                });
            }
            break;
         case "process_docs":
            var update = {
              'current_state':params[1]
            }; 
            if('No'===params[3]){
                loanapplicationhandler.updateLoanApp(sender,update).then(application => {
                    messenger.send(loanapplicationhandler.processLoanApplicationConfirmation(), sender);
                });
            }else{
                loanapplicationhandler.updateLoanApp(sender,update).then(application => {
                    messenger.send(loanapplicationhandler.process_docs(), sender);
                });
            }
            break;
         case "processLoanApplicationConfirmation":
            if('No'===params[3]){
                messenger.send(loanapplicationhandler.error(), sender);
            }else{
                messenger.send(loanapplicationhandler.approvalComplete(), sender);
            }
            break;
         case "Error":
            messenger.send(loanapplicationhandler.error(), sender);
            break;
        default:
          var update = {
              user_id: sender,
              'current_state':params[1]
          };
          loanapplicationhandler.createLoanApp(sender,update).then(application => {
            messenger.send(loanapplicationhandler.createFirstQuestion(), sender);
         });
      }

}

exports.ContinueWithAgent =(sender)=>{
    var update = {
      'stop_bot':true
    }; 
    userinfohandler.updateUserInfo(sender,update).then(user => {
        messenger.send({text: `Transfering now...please wait for an agent. If you need me just type "wakeup"`}, sender);
    });
}
exports.ContinueWithoutAgent =(sender)=>{
    messenger.send({text: `Sorry, my bad. Type "Help" for a list of commands.`}, sender);
}

exports.help = (sender) => {
    messenger.send({text: `*This is for demonstration only*. You can ask me questions like "I want a pre-approval","Loan Status", "Find houses in Boston", "3 bedrooms in Boston", "3 bedrooms in Boston between 500000 and 750000", "show me price changes","rates" or "Transfer to agent"`}, sender);
};

exports.catchall = (sender) => {
    messenger.send({text: `Sorry, I don't understand that command. For list of commands please type "help"`}, sender);
};

exports.creator = (sender)  =>{
    messenger.send({text: `Ah! You are referring to my creator; makes me very happy. I am his bot and for list of commands please type "help"`}, sender);
};

exports.mortgageApply = (sender)  =>{
    messenger.send(formatter.contactLoanOfficer(), sender);
};

