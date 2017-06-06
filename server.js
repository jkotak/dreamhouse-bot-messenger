"use strict";

var express = require('express'),
    bodyParser = require('body-parser'),
    processor = require('./modules/processor'),
    handlers = require('./modules/handlers'),
    postbacks = require('./modules/postbacks'),
    uploads = require('./modules/uploads'),
    menu = require('./modules/menu'),
    FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN,
    app = express();

var stopbot = false;
var isMenuSet = false;
var userid;

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
    userid = token;
    console.log(token+' '+ requestURI);
    //handlers.authenticated(token);
    res.redirect(requestURI+'&authorization_code='+token);
});

app.post('/webhook', (req, res) => {
    if(!isMenuSet){
        Menu.createMenu();
        isMenuSet = true;
    }
    let events = req.body.entry[0].messaging;
    console.log(events);
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        let sender = event.sender.id;
        if (process.env.MAINTENANCE_MODE && ((event.message && event.message.text) || event.postback)) {
            sendMessage({text: `Sorry I'm taking a break right now.`}, sender);
        } else if (event.message && event.message.text && !stopbot) {
            let result = processor.match(event.message.text);
            if (result) {
                let handler = handlers[result.handler];
                if (handler && typeof handler === "function") {
                    handler(sender, result.match);
                } else {
                    console.log("Handler " + result.handlerName + " is not defined. Calling catch all function.");
                    handlers.catchall(sender);
                }
            }else if(event.message.text=='Transfer me'){
                console.log("Asked for Agent");
                stopbot = true;
                handlers.ContinueWithAgent(sender);
            }else if(event.message.text=='Continue with bot'){
                console.log("Asked for Agent");
                handlers.ContinueWithoutAgent(sender);
            }else {
                    console.log("Command" + event.message.text +" is not defined. Calling catch all function. Event.Message" + event.message);
                    handlers.catchall(sender);
            }
        }else if(event.message && event.message.text && stopbot){
            if(event.message.text.toLowerCase()=='wakeup'){
                stopbot = false;
                handlers.wakeup(sender);
            }
        }else if(event.account_linking){
            console.log('status'+event.account_linking.status);
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
    }
    
    res.sendStatus(200);
});
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
