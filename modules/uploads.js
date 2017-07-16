"use strict";

let messenger = require('./messenger'),
    formatter = require('./formatter'),
    salesforce = require('./salesforce'),
    loanapplicationhandler = require('./loanapplicationhandler'),
    casehandler = require('./casehandler'),
    visionService = require('./vision-service-mock');

var apps = ["startcase","startapplication"];


exports.processUpload = (sender, attachments,lastKeyword) => {
    
    if (attachments.length > 0) {
        let attachment = attachments[0];
        if (attachment.type === "image") {
            console.log('apps.indexOf(lastKeyword.toLowerCase())'+apps.indexOf(lastKeyword.toLowerCase()));
            console.log('Last Keyword'+ lastKeyword);
            if(apps.indexOf(lastKeyword.toLowerCase()) > -1){
                
                if(lastKeyword==="startApplication"){
                    loanapplicationhandler.findLoanApp(sender).then(loanApp => {
                        if (loanApp && "process_docs"===loanApp.current_state) {
                             salesforce.createLoanApp(attachment.payload.url,'driver_license',attachment.type,loanApp.salesforce_lead_id,function(err,result){
                                if ( err ) {
                                    // handle the error safely
                                    console.log('Error is', err);
                                }
                             });
                             messenger.send(loanapplicationhandler.processLoanApplicationConfirmation(), sender);
                        }
                    });
                }else if(lastKeyword==="startCase"){
                    casehandler.findCase(sender).then(thiscase => {
                        console.log('This case'+ thiscase.current_stage);
                        if (thiscase && 8===thiscase.current_stage) {
                            var update = {
                              'attachment_type': attachment.type,
                              'attachment_url':attachment.payload.url
                            }; 
                            casehandler.updateCase(sender,update).then(thiscase => { 
                                messenger.send(formatter.formatQuestions('Do you want to upload any more attachments?','createCase',['Yes','No']),sender);
                            }); 
                        }
                    });
                }
            }else{
                messenger.send({text: 'OK, let me look at that picture...'}, sender);
                visionService.classify(attachment.url)
                    .then(houseType => {
                        messenger.send({text: `Looking for houses matching "${houseType}"`}, sender);
                        return salesforce.findPropertiesByCategory(houseType)
                    })
                .then(properties => messenger.send(formatter.formatProperties(properties), sender))
            }
        }else if (attachment.type === "location") {
            visionService.address( attachment.payload.coordinates.lat, attachment.payload.coordinates.long)
                .then(city => {
                    console.log(city);
                    messenger.send({text: `${city}, what a beautiful city! Looking for houses within 10 miles of your vicinity...`}, sender);
                    return salesforce.findProperties({city: city})
                })
                .then(properties => messenger.send(formatter.formatProperties(properties), sender))
        }
        else {
            messenger.send({text: 'This type of attachment is not supported'}, sender);
        }
    }
};
