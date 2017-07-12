"use strict";

var express = require('express'),
    bodyParser = require('body-parser'),
    processor = require('./modules/processor'),
    handlers = require('./modules/handlers'),
    postbacks = require('./modules/postbacks'),
    uploads = require('./modules/uploads'),
    userinfohandler = require("./modules/userinfohandler"),
    menu = require('./modules/menu'),
    validator = require('validator'),
    phoneregex = require('phone-regex'),
    numeral = require('numeral'),
    FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN,
    app = express();

const pvsUrl = process.env.EINSTEIN_URL;
const accountId  = process.env.EINSTEIN_URL;
const privateKey = process.env.EINSTEIN_PRIVATE_KEY;



var isMenuSet = false;
var userid;
var apps = ["startcase"];

app.set('port', process.env.PORT || 5000);

app.use(bodyParser.json());

app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Error, wrong validation token');
    }
});


app.get('/authorize', (req, res) => {
    var requestURI = req.param('redirect_uri');
    var token = req.param('authorization_code');
    this.userid = handlers.userid = postbacks.userid = token;
    console.log(token+' '+ requestURI);
    //handlers.authenticated(token);
    res.redirect(requestURI+'&authorization_code='+token);
});

app.post('/webhook', (req, res) => {
    if (req.body.object == "page") {
        if(!isMenuSet){
            menu.createMenu();
            isMenuSet = true;
        }
        let events = req.body.entry[0].messaging;
        console.log('User ID:' + this.userid);
        for (let i = 0; i < events.length; i++) {
            let event = events[i];
            let sender = event.sender.id;
            userinfohandler.findOneAndUpdateUserInfo(sender,{}).then(user => {
                if (process.env.MAINTENANCE_MODE && ((event.message && event.message.text) || event.postback)) {
                    sendMessage({text: `Sorry I'm taking a break right now.`}, sender);
                } else if (event.message && event.message.text) {
                    let result = processor.match(event.message.text);
                    if (result && 
                            ((user.last_keyword ===null || typeof user.last_keyword === 'undefined') ||  
                             ((user.last_keyword !== null &&  typeof user.last_keyword !== 'undefined' && apps.indexOf(user.last_keyword.toLowerCase())) ===-1 || result.handler==='help' ))) {
                        let handler = handlers[result.handler];
                        console.log('handler:'+ result.handler);
                        if (handler && typeof handler === "function") {
                            userinfohandler.getSetUserHistory(sender,result.handler).then(updateduser => {
                                handler(sender, result.match);
                            });
                        } else {
                            console.log("Handler " + result.handler + " is not defined. Calling catch all function.");
                            handlers.catchall(sender);
                        }
                    }else {
                        console.log(typeof event.message.quick_reply);
                        if(user.last_keyword !== null &&  typeof user.last_keyword !== 'undefined' && user.last_keyword==='startApplication'){
                            if (event.message.quick_reply !== null && typeof event.message.quick_reply === 'object'){
                                var payload = event.message.quick_reply.payload; 
                                console.log('Quick Reply'+ payload);
                                var params = payload.split(",");
                                let handler = handlers[params[0]];
                                if (handler && typeof handler === "function") {
                                    handler(sender,params);
                                }
                            }else if (validator.isEmail(event.message.text)){
                                 let handler = handlers[user.last_keyword];
                                 handler(sender, ['startApplication','askFifthQuestion','email',event.message.text]);
                            }else if (phoneregex({ exact: true }).test(event.message.text)){
                                 let handler = handlers[user.last_keyword];
                                 handler(sender, ['startApplication','askSixthQuestion','phone',event.message.text]);
                            }else if(validator.isCurrency(event.message.text)){
                                let handler = handlers[user.last_keyword];
                                 handler(sender, ['startApplication','askFourthQuestion','amount',numeral(event.message.text).value()]);
                            }else{
                                let handler = handlers[user.last_keyword];
                                console.log("Command" + event.message.text +" is not defined. Calling catch all function. Event.Message" + event.message);
                                handler(sender, ['startApplication','Error']);
                            }
                        }else if (user.last_keyword !== null &&  typeof user.last_keyword !== 'undefined' && user.last_keyword==='startCase'){
                            let handler = handlers[user.last_keyword];
                            handler(sender, [event.message.text]);
                        }else{
                            console.log("Command" + event.message.text +" is not defined. Calling catch all function. Event.Message" + event.message);
                            handlers.catchall(sender); 
                        }
                    }
                }else if(event.account_linking){
                    handlers.authenticated(sender,event.account_linking.authorization_code);
                }else if (event.postback) {
                    let payload = event.postback.payload.split(",");
                    let postback = postbacks[payload[0]];
                    if (postback && typeof postback === "function") {
                        postback(sender, payload);
                    } else {
                        console.log("Postback " + postback + " is not defined");
                    }
                } else if (event.message && event.message.attachments) {
                    uploads.processUpload(sender, event.message.attachments);
                } 
            });//end find user
        }//end loop
    
        res.sendStatus(200);
    }
});




app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
