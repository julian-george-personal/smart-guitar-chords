export enum Environment {
  Local = "Local",
  Production = "Production",
}

export type TConfig = {
  dynamoAccountTableName: string;
  region: string;
  dynamoEndpoint: string | undefined;
  sesEndpoint: string | undefined;
  jwtSecret: string;
  domain: string;
  environment: Environment;
};

const dynamoAccountTableName = process.env.DYNAMO_USER_TABLE_NAME;
if (!dynamoAccountTableName) {
  throw new Error("No DYNAMO_USER_TABLE_NAME was found");
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("No JWT_SECRET was found");
}

const domain = process.env.DOMAIN;
if (!domain) {
  throw new Error("No DOMAIN was found");
}

const environment =
  (process.env.ENVIRONMENT as Environment) || Environment.Production;

const config: TConfig = {
  dynamoAccountTableName,
  region: "us-east-1",
  dynamoEndpoint: process.env.DYNAMO_ENDPOINT,
  sesEndpoint: process.env.SES_ENDPOINT,
  jwtSecret: jwtSecret,
  domain,
  environment,
};
export default config;
