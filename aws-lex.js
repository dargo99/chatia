import { LexRuntimeV2Client, RecognizeTextCommand } from "./node_modules/@aws-sdk/client-lex-runtime-v2";

export class AWSLex {
    constructor() {
        this.client = new LexRuntimeV2Client({ region: 'us-east-1' });
        this.botId = 'JYB8L9JTIV';
        this.botAliasId = 'TSTALIASID';
        this.localeId = 'es_419';
    }

    async postText(inputText) {
        const params = {
            botId: this.botId,
            botAliasId: this.botAliasId,
            localeId: this.localeId,
            sessionId: '4ospbqat2o6n9118dkno65k4q3',
            text: inputText,
            sessionState: {}
        };

        try {
            const data = await this.client.send(new RecognizeTextCommand(params));
            return data;
        } catch (err) {
            console.log(err, err.stack);
            throw err;
        }
    }
}