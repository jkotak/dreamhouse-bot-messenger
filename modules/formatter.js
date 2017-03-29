"use strict";

let moment = require("moment"),
    numeral = require("numeral");

exports.formatProperties = properties => {
    let elements = [];
    if(properties.length==0){
        return {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": "Sorry, no house found with that criteria. Do you want to contact a loan officer?",
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Contact Loan Officer",
                            "payload": "contact_me"
                        }]
                }
            }
        };
    }else{
        properties.forEach(property => {
                elements.push({
                    title: property.get("Title__c"),
                    subtitle: `${property.get("Address__c")}, ${property.get("City__c")} ${property.get("State__c")} · ${numeral(property.get("Price__c")).format('$0,0')}`,
                    "image_url": property.get("Picture__c"),
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Schedule visit",
                            "payload": "schedule_visit," + property.getId()
                        },
                        {
                            "type": "postback",
                            "title": "View realtor info",
                            "payload": "contact_broker," + property.getId()
                        },
                        {
                            "type": "postback",
                            "title": "Contact loan officer",
                            "payload": "contact_me," + property.getId()
                        }
                    ]
                })
            }
        );
        return {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": elements
                }
            }
        };
    }
};

exports.requestLocation = location => {
    return {
        "text":"Please share your location:",
        "quick_replies":[
          {
              "content_type":"location",
              "title":"Send Location",
              "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_LOCATION"
          }
        ]
    };
};

exports.formatProductOptions = productOptions =>{
    let elements = [];
    productOptions.forEach(product => {
            elements.push({  
                "type":"postback",
                "title":product.get("Product_Type__c"),
                "payload":"show_rates," + product.get("Product_Type__c")
            })
        }
    );
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text":"Please select a mortgage product type:",
                "buttons": elements
            }
        }
    };
};

exports.formatProducts = products => {
    let elements = [];
    products.forEach(product => {
            elements.push({
                title: product.get("Product_Name__c"),
                subtitle: `Rate ${product.get("rate__c")}%  · APR ${product.get("apr__c")}%`,
                "buttons": [
                    {
                        "type": "postback",
                        "title": "Contact loan officer",
                        "payload": "contact_me," + product.getId()
                    }
                ]
            })
        }
    );
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
    
};

exports.formatPriceChanges = priceChanges => {
    let elements = [];
    priceChanges.forEach(priceChange => {
            let property = priceChange.get("Parent");
            elements.push({
                title: `${property.Address__c}, ${property.City__c} ${property.State__c}`,
                subtitle: `Old price: ${numeral(priceChange.get("OldValue")).format('$0,0')} · New price: ${numeral(priceChange.get("NewValue")).format('$0,0')} on ${moment(priceChange.get("CreatedDate")).format("MMM Do")}`,
                "image_url": property.Picture__c,
                "buttons": [
                    {
                        "type": "postback",
                        "title": "Schedule visit",
                        "payload": "schedule_visit," + property.Id
                    },
                    {
                        "type": "postback",
                        "title": "View realtor info",
                        "payload": "contact_broker," + property.Id
                    },
                    {
                        "type": "postback",
                        "title": "Contact loan officer",
                        "payload": "contact_me," + property.Id
                    }
                ]
            })
        }
    );
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
};

exports.formatTransferAgent =()=>{
    return {
        "text":"Do you want me to transfer you to a live agent?",
        "quick_replies":[
          {
            "content_type":"text",
            "title":"Yes",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
          },
          {
            "content_type":"text",
            "title":"No",
            "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
          }
        ]
    }
}

exports.formatAppointment = property => {
    var options = [
        moment().add(1, 'days').format('ddd MMM Do') + ' at 10am',
        moment().add(2, 'days').format('ddd MMM Do') + ' at 9am',
        moment().add(2, 'days').format('ddd MMM Do') + ' at 5pm',
        moment().add(3, 'days').format('ddd MMM Do') + ' at 1pm',
        moment().add(3, 'days').format('ddd MMM Do') + ' at 6pm',
    ];
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": `Select one of the available appointments below at ${property.get("Address__c")} in ${property.get("City__c")}.`,
                "buttons": [
                    {
                        "type": "postback",
                        "title": options[0],
                        "payload": "confirm_visit," + property.get("Address__c") + " in " + property.get("City__c") + "," + options[0]
                    },
                    {
                        "type": "postback",
                        "title": options[1],
                        "payload": "confirm_visit," + property.get("Address__c") + " in " + property.get("City__c") + "," + options[1]
                    },
                    {
                        "type": "postback",
                        "title": options[2],
                        "payload": "confirm_visit," + property.get("Address__c") + " in " + property.get("City__c") + "," + options[2]
                    }]
            }
        }
    };
};

exports.formatBroker = broker => {
    let elements = [];
    elements.push({
        title: "Stephanie Diebel",
        subtitle: "Senior Realtor  · 617-219-6363 · kotakj@gmail.com",
        "image_url": "https://s3-us-west-1.amazonaws.com/sfdc-demo/messenger/caroline_500x260.png",
        "buttons": [
            {
                "type": "postback",
                "title": "Contact Me",
                "payload": "contact_me"
            }]
    });
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
};
