import {
  DynamoDBClient,
  QueryCommand,
  DeleteItemCommand,
  AttributeValue,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  PutCommandInput,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import config from "../config";
import { unmarshall } from "@aws-sdk/util-dynamodb";

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

const defaultSk = "0";

function filterItem(item?: any) {
  if (!item) return null;
  const { PK, SK, ...filteredItem } = item;
  return filteredItem;
}
function parseItem(item?: Record<string, AttributeValue>) {
  if (!item) return null;
  return filterItem(unmarshall(item));
}

export async function get(pkType: PkType, key: string, itemId?: string) {
  const result = await db.send(
    new GetCommand({
      TableName: config.dynamoAccountTableName,
      Key: { PK: `${pkType}#${key}`, SK: itemId ?? defaultSk },
    })
  );
  return filterItem(result.Item);
}

export async function getRange(
  pkType: PkType,
  keyPrefix: string
): Promise<unknown[] | undefined> {
  const prefixExpression = ":keyPrefix";
  const result = await db.send(
    new QueryCommand({
      TableName: config.dynamoAccountTableName,
      KeyConditionExpression: `PK = ${prefixExpression}`,
      ExpressionAttributeValues: {
        [prefixExpression]: { S: `${pkType}#${keyPrefix}` },
      },
    })
  );
  return result.Items?.map(parseItem);
}

export async function put(
  pkType: PkType,
  key: string,
  item: object,
  itemId?: string
) {
  const commandObj: PutCommandInput = {
    TableName: config.dynamoAccountTableName,
    Item: { PK: `${pkType}#${key}`, SK: itemId ?? defaultSk, ...item },
  };
  return (await db.send(new PutCommand(commandObj))).Attributes;
}

export async function update(
  pkType: PkType,
  key: string,
  itemUpdates: object,
  itemId?: string,
  returnItem: boolean = false
) {
  const commandObj: UpdateCommandInput = {
    TableName: config.dynamoAccountTableName,
    Key: { PK: `${pkType}#${key}`, SK: itemId ?? defaultSk },
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
  return parseItem(
    (await client.send(new UpdateCommand(commandObj))).Attributes
  );
}

export async function remove(pkType: PkType, key: string, itemId?: string) {
  const idSuffix = itemId ? `#${itemId}` : "";
  return await db.send(
    new DeleteItemCommand({
      TableName: config.dynamoAccountTableName,
      Key: { PK: { S: `${pkType}#${key}${idSuffix}` } },
    })
  );
}
