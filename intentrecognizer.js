const { LuisRecognizer } = require('botbuilder-ai');

class IntentRecognizer{
    constructor(config){
        const isLuisConfigured = config && config.applicationId && config.endpointKey && config.endpoint;
        // console.log("Config "+ config);
        // console.log("Application ID "+ config.applicationId);
        // console.log("endpointKey "+ config.endpointKey);
        // console.log("endpoint "+ config.endpoint);
        if(isLuisConfigured){

            const recognizerOptions = {
                apiVersion: 'v3'
            };
            console.log("LUIS is configured successfully");
            this.recognizer = new LuisRecognizer(config, recognizerOptions);
            return;
        }
        console.log("LUIS isn't configured.");
    }

    get isConfigured(){
        return (this.recognizer !== undefined);
    }

    /**
     * Returns an object with perforated LUIS results for bot's dialogs to consume     
    @param {TurnContext} context
    */
    async executeLuisQuery(context){
        return await this.recognizer.recognize(context);
    }

    getLocationEntity(result){
        const locationEntity = result.entities.location;
        if(!locationEntity || !locationEntity[0]) return undefined;
        return locationEntity;
    }
}

module.exports = IntentRecognizer