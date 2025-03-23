export type TConfig = {
  dynamoAccountTableName: string;
  region: string;
  dynamoEndpoint: string | undefined;
};

const dynamoAccountTableName = process.env.DYNAMO_USER_TABLE_NAME;
if (!dynamoAccountTableName) {
  throw new Error("No DYNAMO_USER_TABLE_NAME was found");
}

const config: TConfig = {
  dynamoAccountTableName,
  region: "us-east-1",
  dynamoEndpoint: process.env.DYNAMO_ENDPOINT,
};
export default config;
