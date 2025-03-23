export type TConfig = {
  dynamoUserTableName: string;
  region: string;
  dynamoEndpoint: string | undefined;
};

const dynamoUserTableName = process.env.DYNAMO_USER_TABLE_NAME;
if (!dynamoUserTableName) {
  throw new Error("No DYNAMO_USER_TABLE_NAME was found");
}

const config: TConfig = {
  dynamoUserTableName,
  region: "us-east-1",
  dynamoEndpoint: process.env.DYNAMO_ENDPOINT,
};
export default config;
