import { CreateTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import config from "../src/server/config";

const client = new DynamoDBClient({
  region: config.region,
  endpoint: config.dynamoEndpoint,
});

const db = DynamoDBDocumentClient.from(client);

console.log("Creating account table...");

await db.send(
  new CreateTableCommand({
    TableName: config.dynamoAccountTableName,
    KeySchema: [{ AttributeName: "PK", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "PK", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  })
);
