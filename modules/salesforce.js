"use strict";

let nforce = require('nforce'),
    request = require('request'),
    SF_CLIENT_ID = process.env.SF_CLIENT_ID,
    SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET,
    SF_USER_NAME = process.env.SF_USER_NAME,
    SF_PASSWORD = process.env.SF_PASSWORD;


let org = nforce.createConnection({
    clientId: SF_CLIENT_ID,
    clientSecret: SF_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/oauth/_callback',
    mode: 'single',
    autoRefresh: true
});

let login = () => {
    org.authenticate({username: SF_USER_NAME, password: SF_PASSWORD}, err => {
        if (err) {
            console.error("Authentication error");
            console.error(err);
        } else {
            console.log("Authentication successful");
        }
    });
};

let findProperties = (params) => {
    let where = "";
    if (params) {
        let parts = [];
        if (params.id) parts.push(`id='${params.id}'`);
        if (params.city) parts.push(`city__c='${params.city}'`);
        if (params.bedrooms) parts.push(`beds__c=${params.bedrooms}`);
        if (params.priceMin) parts.push(`price__c>=${params.priceMin}`);
        if (params.priceMax) parts.push(`price__c<=${params.priceMax}`);
        if (parts.length>0) {
            where = "WHERE " + parts.join(' AND ');
        }
    }
    return new Promise((resolve, reject) => {
        let q = `SELECT id,
                    title__c,
                    address__c,
                    city__c,
                    state__c,
                    price__c,
                    beds__c,
                    baths__c,
                    picture__c
                FROM property__c
                ${where}
                LIMIT 5`;
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

let findPropertiesByCategory = (category) => {
    return new Promise((resolve, reject) => {
        let q = `SELECT id,
                    title__c,
                    address__c,
                    city__c,
                    state__c,
                    price__c,
                    beds__c,
                    baths__c,
                    picture__c
                FROM property__c
                WHERE tags__c LIKE '%${category}%'
                LIMIT 5`;
        console.log(q);
        org.query({query: q}, (err, resp) => {
            if (err) {
                console.error(err);
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });

};

let getLoanStatus = (userid) => {
    return new Promise((resolve, reject) => {
        let q = `Select 
                    Status__c,
                    Loan_Number__c,
                    owner.name
                  From X1003_Application__c 
                  Where Borrower__c in (select Contactid from user where id = '${userid}')`;
        console.log(q);
        org.query({query: q}, (err, resp) => {
            if (err) {
                console.error(err);
                reject("An error as occurred");
            } else {
                console.log(resp.records);
                resolve(resp.records);
            }
        });
    });

};

let getPaymentStatus = (userid) => {
    return new Promise((resolve, reject) => {
        let q = `Select 
                    Amount__c,
                    Due_Date__c,
                    Payment_Recieved__c
                  From Payment_History__c 
                  Where Contact__c in (select Contactid from user where id = '${userid}') Limit 1`;
        console.log(q);
        org.query({query: q}, (err, resp) => {
            if (err) {
                console.error(err);
                reject("An error as occurred");
            } else {
                console.log(resp.records);
                resolve(resp.records);
            }
        });
    });

};

let findPriceChanges = () => {
    return new Promise((resolve, reject) => {
        let q = `SELECT
                    OldValue,
                    NewValue,
                    CreatedDate,
                    Field,
                    Parent.Id,
                    Parent.title__c,
                    Parent.address__c,
                    Parent.city__c,
                    Parent.state__c,
                    Parent.price__c,
                    Parent.beds__c,
                    Parent.baths__c,
                    Parent.picture__c
                FROM property__history
                WHERE field = 'Price__c'
                ORDER BY CreatedDate DESC
                LIMIT 3`;
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });
};

let findAllRateTypes = () => {
    return new Promise((resolve, reject) => {
        let q = `SELECT
                    Product_Type__c,
                    count(Name)
                FROM Rate_Sheet__c
                Group By Product_Type__c
                LIMIT 3`;
        console.log("Query "+ q);
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });
};

let findRate = (params) => {
    return new Promise((resolve, reject) => {
        let q = `SELECT
                    rate__c,
                    id,
                    apr__c,
                    Product_Name__c
                    FROM Rate_Sheet__c
                    WHERE Product_Type__c LIKE '${params.productType}'
                    LIMIT 5`;
        console.log("Query "+ q);
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });
}
    

let createCase = (customerId, firstName, lastName, customerPhone,type,sub_type,description,sentiment) => {
    return new Promise((resolve, reject) => {
         let c = nforce.createSObject('Case');
        c.set('description', description);
        c.set('status', 'New');
        c.set('type', type);
        c.set('SuppliedPhone', customerPhone);
        c.set('Sub_Type__c', sub_type);
        c.set('subject', 'Issue with '+ type);
        c.set('SuppliedName', firstName + lastName);
        c.set('Sentiment__c', sentiment);
        c.set('Origin', 'Facebook Bot');
        
        org.insert({sobject: c}).then(function (data) {
            resolve(data)
         });
    });

};

let updateCaseAttachment = (salesforce_case_id,fileURL, fileType) => {
    var requestSettings = {
        method: 'GET',
        url: fileURL,
        encoding: null
    };
    request.get(requestSettings, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            return new Promise((resolve, reject) => {
                console.log('creating image');
               var c = nforce.createSObject('Attachment', {
                    Name: 'CaseAttachment.jpg',
                    Description: 'This is a case document',
                    ParentId: salesforce_case_id,
                    attachment: {
                      fileName: 'CaseAttachment.jpg',
                      ContentType:response.headers["content-type"] ,
                      body: body
                    }
                });
                org.insert({sobject: c}, err => {
                    if (err) {
                        console.error(err);
                        reject("An error occurred while creating a lead");
                    } else {
                        resolve(c);
                    }
                });
            });
        }
    });
};

let createLead = (propertyId, customerFirstName, customerLastName, customerId) => {

    return new Promise((resolve, reject) => {
         let c = nforce.createSObject('Lead');
        c.set('firstname', `Contact ${customerFirstName} (Facebook Customer)`);
        c.set('lastname', customerLastName);
        c.set('description', "Facebook id: " + customerId);
        c.set('LeadSource', 'Facebook Bot');
        c.set('status', 'New');
        c.set('Properties__c', propertyId);

        org.insert({sobject: c}, err => {
            if (err) {
                console.error(err);
                reject("An error occurred while creating a lead");
            } else {
                resolve(c);
            }
        });
    });

};



let createLeadApp = (customerFirstName, customerLastName, phone, email, amount,customerId) => {

    return new Promise((resolve, reject) => {
         let c = nforce.createSObject('Lead');
        c.set('firstname', customerFirstName);
        c.set('lastname', customerLastName);
        c.set('description', "Facebook id: " + customerId);
        c.set('LeadSource', 'Facebook Bot');
        c.set('status', 'New');
        c.set('phone', phone);
        c.set('email', email);
        c.set('Send_Pre_approval__c',true);
        c.set('Loan_Amount_Requested__c',amount);

        org.insert({sobject: c}).then(function (data) {
            console.log(data.id);
            resolve(data)
         });
    });

};


let createLoanApp = (fileURL, fileName, fileType,salesforce_lead_id) => {
    var requestSettings = {
        method: 'GET',
        url: fileURL,
        encoding: null
    };
    request.get(requestSettings, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            return new Promise((resolve, reject) => {
                console.log('creating image');
               var c = nforce.createSObject('Attachment', {
                    Name: 'facebookdocument.jpg',
                    Description: 'This is a test document',
                    ParentId: salesforce_lead_id,
                    attachment: {
                      fileName: 'facebookdocument.jpg',
                      ContentType:response.headers["content-type"] ,
                      body: body
                    }
                });
                org.insert({sobject: c}, err => {
                    if (err) {
                        console.error(err);
                        reject("An error occurred while creating a lead");
                    } else {
                        resolve(c);
                    }
                });
            });
        }
    });
};





login();

exports.org = org;
exports.findProperties = findProperties;
exports.findPropertiesByCategory = findPropertiesByCategory;
exports.findPriceChanges = findPriceChanges;
exports.findAllRateTypes = findAllRateTypes;
exports.findRate = findRate;
exports.createLead = createLead;
exports.createLeadApp = createLeadApp;
exports.createCase = createCase;
exports.getLoanStatus = getLoanStatus;
exports.getPaymentStatus = getPaymentStatus;
exports.createLoanApp = createLoanApp;
exports.updateCaseAttachment = updateCaseAttachment;
