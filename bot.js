// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

const { QnAMaker } = require('botbuilder-ai');

class EchoBot extends ActivityHandler {
    constructor(configuration, qnaOptions) {
        super();
        if (!configuration) throw new Error('[QnA Bot]: Missng parameter, configuration is required');
        //create a qna connector
        this.qnaMaker = new QnAMaker(configuration.QnAConfiguration, qnaOptions);
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            // const replyText = `Echo: ${ context.activity.text }`;
            // await context.sendActivity(MessageFactory.text(replyText, replyText)); 
            // // By calling next() you ensure that the next BotHandler is run.
            // await next();

            //Send User input to QnA Maker
            const qnaResults = await this.qnaMaker.getAnswers(context);
            //If an answer was recieved  from QnAMaker Service, send it back to the user
            if(qnaResults[0]){
                console.log(qnaResults[0]);
                await context.sendActivity(`${qnaResults[0].answer}`);
            }
            else{
                //If no answer were returned from QnAMaker , reply with help
                await context.sendActivity(`I'm not sure `
                + 'I found an answer  to your question'
                + 'You can ask me questions about electric vehicles like "How can I charge my car?"');
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
