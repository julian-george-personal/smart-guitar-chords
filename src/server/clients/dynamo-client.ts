import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  PutCommandInput,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import config from "../config";

export enum PkType {
  AccountInfo = "USER",
  Song = "SONG",
  EmailUsername = "EMAIL",
}

const client = new DynamoDBClient({
  region: config.region,
  endpoint: config.dynamoEndpoint,
});

const db = DynamoDBDocumentClient.from(client);

export async function get(pkType: PkType, key: string) {
  const result = await db.send(
    new GetCommand({
      TableName: config.dynamoAccountTableName,
      Key: { PK: `${pkType}#${key}` },
    })
  );
  return result.Item;
}

export async function getRange(
  pkType: PkType,
  keyPrefix: string
): Promise<unknown[] | undefined> {
  const prefixExpression = ":keyPrefix";
  const result = await db.send(
    new QueryCommand({
      TableName: config.dynamoAccountTableName,
      KeyConditionExpression: `begins_with(PK, ${prefixExpression})`,
      ExpressionAttributeValues: {
        [prefixExpression]: { S: `${pkType}#${keyPrefix}` },
      },
    })
  );
  return result.Items;
}

export async function put(
  pkType: PkType,
  key: string,
  item: object,
  itemId?: string,
  returnItem: boolean = false
) {
  const idSuffix = itemId ? `#${itemId}` : "";
  const commandObj: PutCommandInput = {
    TableName: config.dynamoAccountTableName,
    Item: { PK: `${pkType}#${key}${idSuffix}`, ...item },
  };
  if (returnItem) commandObj.ReturnValues = "ALL_NEW";
  return (await db.send(new PutCommand(commandObj))).Attributes;
}

export async function update(
  pkType: PkType,
  key: string,
  itemUpdates: object,
  itemId?: string,
  returnItem: boolean = false
) {
  const idSuffix = itemId ? `#${itemId}` : "";
  const commandObj: UpdateCommandInput = {
    TableName: config.dynamoAccountTableName,
    Key: { PK: `${pkType}#${key}${idSuffix}` },
    // {propertyA: valueA, propertyB: valueB} => SET propertyA=:propertyA; propertyB=:propertyB
    UpdateExpression: `SET ${Object.keys(itemUpdates)
      .map((key) => `${key}=:${key}`)
      .join("; ")}`,
    // {propertyA: valueA, propertyB: valueB} => {:propertyA: valueA, :propertyB: valueB}
    ExpressionAttributeValues: Object.fromEntries(
      Object.entries(itemUpdates).map(([key, value]) => [`:${key}`, value])
    ),
  };
  if (returnItem) commandObj.ReturnValues = "ALL_NEW";
  return (await client.send(new UpdateCommand(commandObj))).Attributes;
}
