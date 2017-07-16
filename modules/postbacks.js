"use strict";

let salesforce = require('./salesforce'),
    messenger = require('./messenger'),
    formatter = require('./formatter'),
    loanapplicationhandler = require('./loanapplicationhandler'),
    userinfohandler = require('./userinfohandler'),
    casehandler = require('./casehandler');

let userid = null;

exports.schedule_visit = (sender, values) => {
    console.log("Values " + values);
    console.log("Values1 " + values[1]);
    salesforce.findProperties({id: values[1]}).then(properties => {
        messenger.send(formatter.formatAppointment(properties[0]), sender);
    });
};

exports.contact_broker = (sender, values) => {
    messenger.send({text: "Here is the realtor information for this property"}, sender);
    messenger.send(formatter.formatBroker(), sender);
};

exports.confirm_visit = (sender, values) => {
    messenger.send({text: `OK, your appointment is confirmed for ${values[2]}. ${values[1]}.`}, sender);
};

exports.show_rates = (sender,values) => {
    console.log("Values " + values);
    console.log("Values1 " + values[1]);
    salesforce.findRate({productType: values[1]}).then(products => {
        console.log("Values " + products);
        messenger.send(formatter.formatProducts(products), sender);
    });
};

exports.contact_me = (sender, values) => {

    let propertyId = values[1];
    messenger.send({text: `Thanks for your interest. I asked the loan officer to contact you asap. Before you leave, could you please provide feedback to my creator at http://bit.ly/2qOPctw ?`}, sender);
    messenger.getUserInfo(sender).then(response => {
        salesforce.createLead(propertyId, response.first_name, response.last_name, sender);
    });
};

exports.houses_near_me = (sender, values) => {
    messenger.send(formatter.requestLocation(), sender);
};

exports.next_payment = (sender, values) => {
    messenger.getUserInfo(sender).then(response => {
        messenger.send({text: `Sorry, ${response.first_name}! My creator hasn't gotten to this yet. Please be patient and type "help" for list of commands for other options.`}, sender);
    });
};


exports.contact_support = (sender, values) => {
    messenger.getUserInfo(sender).then(response => {
        var current_stage = 0;
        var update = {
            "current_stage":0
        };
        casehandler.updateCase(sender,update).then(thiscase => { 
            userinfohandler.getSetUserHistory(sender,"startCase").then(() => {
               messenger.send(casehandler.createQuestion(sender,current_stage,values[0]), sender);
            });
        });
    });
};


exports.loan_status = (sender,values) =>{
    if(this.userid!=null){
        salesforce.getLoanStatus(userid).then(loans => {
            messenger.send(formatter.formatLoans(loans), sender);
        });
    }else{
        messenger.send(formatter.formatLoanAccountLinking(), sender);
    }
};

exports.occupancy_type = (sender,values) => {
    messenger.send(loanapplicationhandler.createSecondQuestion(), sender);
}

exports.GET_STARTED_PAYLOAD = (sender, values) => {
    messenger.getUserInfo(sender).then(response => {
        messenger.send({text: `Hi, ${response.first_name}! Thanks for getting in touch with us on Messenger. Please type "help" for list of commands to get started. And before I forget, you can also use the menu below to interact with me.`}, sender);
    });
};


