export enum Environment {
  Local = "Local",
  Production = "Production",
}

export type TConfig = {
  environment: Environment;
  port: number;
  dynamoAccountTableName: string;
  region: string;
  dynamoEndpoint: string | undefined;
  jwtSecret: string;
  domain: string;
  sendgrid: {
    apiKey: string;
    recoverPasswordTemplateId: string;
  };
  sentry: {
    dsn: string | undefined;
  };
};

const environment =
  (process.env.ENVIRONMENT as Environment) || Environment.Production;

const port = parseInt(process.env.PORT ?? "NaN");
if (!port) {
  throw new Error("No PORT was found");
}

const dynamoAccountTableName = process.env.DYNAMO_USER_TABLE_NAME;
if (!dynamoAccountTableName) {
  throw new Error("No DYNAMO_USER_TABLE_NAME was found");
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("No JWT secret was found");
}

const domain = process.env.DOMAIN;
if (!domain) {
  throw new Error("No DOMAIN was found");
}

const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (!sendgridApiKey) {
  throw new Error("No SENDGRID_API_KEY was found");
}

// TODO: it really sucks that I have to do this. twilio api designers are brain dead
const sendgridRecoverPasswordTemplateId =
  process.env.RECOVER_PASSWORD_TEMPLATE_ID;
if (!sendgridRecoverPasswordTemplateId) {
  throw new Error("No RECOVER_PASSWORD_TEMPLATE_ID was found");
}

const config: TConfig = {
  environment,
  port,
  dynamoAccountTableName,
  region: "us-east-1",
  dynamoEndpoint: process.env.DYNAMO_ENDPOINT,
  jwtSecret: jwtSecret,
  domain,
  sendgrid: {
    apiKey: sendgridApiKey,
    recoverPasswordTemplateId: sendgridRecoverPasswordTemplateId,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
};
export default config;
