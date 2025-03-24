import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import config from "./config";

const client = new DynamoDBClient({
  region: config.region,
  endpoint: config.dynamoEndpoint,
});

const db = DynamoDBDocumentClient.from(client);

type TAccount = {
  username: string;
  hashedPassword: string;
  email: string;
};

export async function putNewAccount(
  username: string,
  hashedPassword: string,
  email: string
) {
  await db.send(
    new PutCommand({
      TableName: config.dynamoAccountTableName,
      Item: { username, hashedPassword, email },
    })
  );
}

export async function getAccountByUsername(
  username: string
): Promise<TAccount | null> {
  const result = await db.send(
    new GetCommand({
      TableName: config.dynamoAccountTableName,
      Key: { username },
    })
  );
  return (result.Item as TAccount | undefined) ?? null;
}

export async function getAccountByEmail(
  email: string
): Promise<TAccount | null> {
  const result = await db.send(
    new QueryCommand({
      TableName: config.dynamoAccountTableName,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    })
  );

  return (result.Items as TAccount[])?.[0] || null;
}
