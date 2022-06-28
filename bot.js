// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

const { QnAMaker } = require('botbuilder-ai');

const IntentRecognizer = require("./intentrecognizer")

class EchoBot extends ActivityHandler {
    constructor(configuration, qnaOptions) {
        super();
        if (!configuration) throw new Error('[QnA Bot]: Missng parameter, configuration is required');
        //create a qna connector
        this.qnaMaker = new QnAMaker(configuration.QnAConfiguration, qnaOptions);

        //create a LUIS connector
        this.intentRecognizer = new IntentRecognizer(configuration.LUISConfiguration);
        
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            // const replyText = `Echo: ${ context.activity.text }`;
            // await context.sendActivity(MessageFactory.text(replyText, replyText)); 
            // // By calling next() you ensure that the next BotHandler is run.
            // await next();

            //Send User input to QnA Maker
            const qnaResults = await this.qnaMaker.getAnswers(context);

            //Send User input to LUIS 
            const luisResults = await this.intentRecognizer.executeLuisQuery(context);

            // if(luisResults.luisResult.prediction.topIntent)
            // {
            //     console.log(luisResults.luisResult.prediction.topIntent);
            // }
            // if(luisResults.intents.findParking){
            //     console.log(luisResults.intents.findParking.score);
            // }
            // if(luisResults.entities.$instance){
            //     console.log(luisResults.entities.$instance);
            // }
            // if(luisResults.entities.$instance.location){
            //     console.log(luisResults.entities.$instance.location);
            //     console.log(luisResults.entities.$instance.location[0]);
            // }
            
            //Determine which service to respond with
            if(luisResults.luisResult.prediction.topIntent === 'findParking' &&
               luisResults.intents.findParking.score > 0.6 &&
               luisResults.entities.$instance &&
               luisResults.entities.$instance.location &&
               luisResults.entities.$instance.location[0]){
                    const location = luisResults.entities.$instance.location[0].text;
                    //call API  with location entity info
                    const getLocationOfParking = "I found parking with a charging station at " + location;
                    console.log(getLocationOfParking);
                    await context.sendActivity(getLocationOfParking);
                    await next();
                    return;
                }
            
            //If an answer was recieved  from QnAMaker Service, send it back to the user
            if(qnaResults[0]){
                console.log(qnaResults[0]);
                await context.sendActivity(`${qnaResults[0].answer}`);
            }
            else{
                //If no answer were returned from QnAMaker , reply with help
                await context.sendActivity(`I'm not sure I can answer your question`
                + 'I can find charging stations or electric vehicle parking'
                + 'Or you can ask me questions about electric vehicles');
            }
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Welcome to EV Parking Assistant.  I can help you find a charging station and parking.  You can say "find a charging station" or "find parking" or ask a question about electric vehicle charging';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
