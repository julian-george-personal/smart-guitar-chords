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
  resend: {
    apiKey: string;
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

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  throw new Error("No RESEND_API_KEY was found");
}

const config: TConfig = {
  environment,
  port,
  dynamoAccountTableName,
  region: "us-east-1",
  dynamoEndpoint: process.env.DYNAMO_ENDPOINT,
  jwtSecret: jwtSecret,
  domain,
  resend: {
    apiKey: resendApiKey,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
};
export default config;
