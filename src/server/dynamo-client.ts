import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import config from "./config";

const client = new DynamoDBClient({
  region: config.region,
  endpoint: config.dynamoEndpoint,
});

const db = DynamoDBDocumentClient.from(client);

export async function putNewUser(
  username: string,
  hashedPassword: string,
  email: string
) {
  await db.send(
    new PutCommand({
      TableName: config.dynamoUserTableName,
      Item: { username, hashedPassword, email },
    })
  );
}

export async function getUser(userId: string) {
  const result = await db.send(
    new GetCommand({
      TableName: "users",
      Key: { userId },
    })
  );
  return result.Item;
}

// Get all users
export async function listUsers() {
  const result = await db.send(new ScanCommand({ TableName: "users" }));
  return result.Items;
}
