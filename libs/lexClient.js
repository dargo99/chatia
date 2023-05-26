const { CognitoIdentityClient } = require("@aws-sdk/client-cognito-identity");
const { fromCognitoIdentityPool } = require("@aws-sdk/credential-provider-cognito-identity");
const { LexRuntimeServiceClient } = require("@aws-sdk/client-lex-runtime-service");

const REGION = "us-east-1";
const IDENTITY_POOL_ID = "us-east-1:a17101db-a6eb-421d-81bf-cdefa561430e"; // An Amazon Cognito Identity Pool ID.

// Create an Amazon Lex service client object.
const lexClient = new LexRuntimeServiceClient({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: REGION }),
    identityPoolId: IDENTITY_POOL_ID,
  }),
});

module.exports = { lexClient };
