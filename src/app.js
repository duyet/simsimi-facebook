'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('node-uuid');
const request = require('request');

const REST_PORT = (process.env.PORT || 5000);
const SIMSIMI_KEY = process.env.SIMSIMI_KEY;
const SIMSIMI_LANGUAGE = process.env.SIMSIMI_LANGUAGE || 'vn';
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'none';
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

const sessionIds = new Map();

function processEvent(event) {
    var sender = event.sender.id;

    if (event.message && event.message.text) {
        var text = event.message.text;
        // Handle a text message from this sender

        if (!sessionIds.has(sender)) {
            sessionIds.set(sender, uuid.v1());
        }

        console.log("Text", text);



        var options = { method: 'GET',
          url: 'http://api.simsimi.com/request.p',
          qs: 
           { key: SIMSIMI_KEY,
             lc: SIMSIMI_LANGUAGE,
             ft: '',
             text: text },
          headers: 
           { 'postman-token': 'b241d2e0-2ac5-8693-e634-55affd36e766',
             'cache-control': 'no-cache',
             'content-type': 'multipart/form-data; boundary=---011000010111000001101001' },
          formData: { uuid: sessionIds.get(sender), os: '111', type: 'NA' } };

        request(options, function (error, response, body) {
          if (error) throw new Error(error);

          if (isDefined(body)) {
            let responseText = body.response;

            console.log('==> body', body);
            console.log('==> FB_PAGE_ACCESS_TOKEN', FB_PAGE_ACCESS_TOKEN);

            sendFBMessage(sender, {text: responseText});
          }

          // console.log(' ==> ', body);
        });


        // let apiaiRequest = apiAiService.textRequest(text,
        //     {
        //         sessionId: sessionIds.get(sender)
        //     });

        // apiaiRequest.on('response', (response) => {
        //     if (isDefined(response.result)) {
        //         let responseText = response.result.fulfillment.speech;
        //         let responseData = response.result.fulfillment.data;
        //         let action = response.result.action;

        //         if (isDefined(responseData) && isDefined(responseData.facebook)) {
        //             try {
        //                 console.log('Response as formatted message');
        //                 sendFBMessage(sender, responseData.facebook);
        //             } catch (err) {
        //                 sendFBMessage(sender, {text: err.message });
        //             }
        //         } else if (isDefined(responseText)) {
        //             console.log('Response as text message');
        //             sendFBMessage(sender, {text: responseText});
        //         }

        //     }
        // });

        // apiaiRequest.on('error', (error) => console.error(error));
        // apiaiRequest.end();
    }
}

function sendFBMessage(sender, messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages?access_token=' + FB_PAGE_ACCESS_TOKEN,
        method: 'POST',
        json: {
            recipient: {id: sender},
            message: messageData
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

function doSubscribeRequest() {
    request({
            method: 'POST',
            uri: "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=" + FB_PAGE_ACCESS_TOKEN
        },
        function (error, response, body) {
            if (error) {
                console.error('Error while subscription: ', error);
            } else {
                console.log('Subscription result: ', response.body);
            }
        });
}

function isDefined(obj) {
    if (typeof obj == 'undefined') {
        return false;
    }

    if (!obj) {
        return false;
    }

    return obj != null;
}

const app = express();
app.use(bodyParser.json());
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, content-type, accept");
    next();
});

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] == FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
        
        setTimeout(function () {
            doSubscribeRequest();
        }, 3000);
    } else {
        res.send('Error, wrong validation token');
    }
});

app.post('/webhook/', function (req, res) {
    try {
        var messaging_events = req.body.entry[0].messaging;
        for (var i = 0; i < messaging_events.length; i++) {
            var event = req.body.entry[0].messaging[i];
            processEvent(event);
        }
        return res.status(200).json({
            status: "ok"
        });
    } catch (err) {
        return res.status(400).json({
            status: "error",
            error: err
        });
    }

});

app.listen(REST_PORT, function () {
    console.log('Rest service ready on port ' + REST_PORT);
});

doSubscribeRequest();