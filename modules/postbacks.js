"use strict";

let salesforce = require('./salesforce'),
    messenger = require('./messenger'),
    formatter = require('./formatter');

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

exports.loan_status = (sender,values) =>{
    if(userid!=null){
        salesforce.getLoanStatus(userid).then(loans => {
            messenger.send(formatter.formatLoans(loans), sender);
        });
    }else{
        messenger.send(formatter.formatLoanAccountLinking(), sender);
    }
};

exports.GET_STARTED_PAYLOAD = (sender, values) => {
    messenger.getUserInfo(sender).then(response => {
        messenger.send({text: `Hi, ${response.first_name}! Thanks for getting in touch with us on Messenger. Please type "help" for list of commands to get started.`}, sender);
    });
};


