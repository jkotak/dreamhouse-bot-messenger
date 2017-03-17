"use strict";

let messenger = require('./messenger'),
    formatter = require('./formatter'),
    salesforce = require('./salesforce'),
    visionService = require('./vision-service-mock');

exports.processUpload = (sender, attachments) => {
    if (attachments.length > 0) {
        let attachment = attachments[0];
        if (attachment.type === "image") {
            messenger.send({text: 'OK, let me look at that picture...'}, sender);
            visionService.classify(attachment.url)
                .then(houseType => {
                    messenger.send({text: `Looking for houses matching "${houseType}"`}, sender);
                    return salesforce.findPropertiesByCategory(houseType)
                })
                .then(properties => messenger.send(formatter.formatProperties(properties), sender))
        }else if (attachment.type === "location") {
            console.log('This is a location' + attachment.payload.coordinates.lat);
            messenger.send({text: 'OK, looking for houses within 5 miles of that location...'}, sender);
            visionService.address( attachment.payload.coordinates.lat, attachment.payload.coordinates.long)
                .then(houseType => {
                    messenger.send({text: `Looking for houses matching "${houseType}"`}, sender);
                    return salesforce.findProperties(houseType)
                })
                .then(properties => messenger.send({text: `Done`}, sender))
        }
        else {
            messenger.send({text: 'This type of attachment is not supported'}, sender);
        }
    }
};
