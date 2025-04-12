import { DynamoDBClient, ReturnValue } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
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

type TEmailUsername = {
  username: string;
};

const buildUsernamePk = (username: string) => `NAME#${username}`;
const buildEmailPk = (email: string) => `EMAIL#${email}`;
const buildSongsPk = (username: string) => `SONGS#${username}`;

export async function putNewAccount(
  username: string,
  hashedPassword: string,
  email: string
) {
  await db.send(
    new PutCommand({
      TableName: config.dynamoAccountTableName,
      Item: { PK: buildUsernamePk(username), username, hashedPassword, email },
    })
  );
  await db.send(
    new PutCommand({
      TableName: config.dynamoAccountTableName,
      Item: { PK: buildEmailPk(email), username },
    })
  );
}

export async function getAccountByUsername(
  username: string
): Promise<TAccount | null> {
  const result = await db.send(
    new GetCommand({
      TableName: config.dynamoAccountTableName,
      Key: { PK: buildUsernamePk(username) },
    })
  );
  return (result.Item as TAccount | undefined) ?? null;
}

export async function getAccountByEmail(
  email: string
): Promise<TEmailUsername | null> {
  const result = await db.send(
    new GetCommand({
      TableName: config.dynamoAccountTableName,
      Key: { PK: buildEmailPk(email) },
    })
  );
  return (result.Item as TEmailUsername | undefined) ?? null;
}

export async function setAccountNewPassword(
  email: string,
  hashedPassword: string
) {
  const hashedPasswordExpression = "hashedPassword";
  const account = await getAccountByEmail(email);

  if (!account) {
    throw new Error("User not found");
  }

  await client.send(
    new UpdateCommand({
      TableName: config.dynamoAccountTableName,
      Key: { PK: buildUsernamePk(account.username) },
      UpdateExpression: `SET ${hashedPasswordExpression} = :${hashedPasswordExpression}`,
      ExpressionAttributeValues: {
        [`:${hashedPasswordExpression}`]: hashedPassword,
      },
    })
  );
}
