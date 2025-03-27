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
  sesEndpoint: string | undefined;
  jwtSecret: string;
  domain: string;
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

const config: TConfig = {
  environment,
  port,
  dynamoAccountTableName,
  region: "us-east-1",
  dynamoEndpoint: process.env.DYNAMO_ENDPOINT,
  sesEndpoint: process.env.SES_ENDPOINT,
  jwtSecret: jwtSecret,
  domain,
};
export default config;
