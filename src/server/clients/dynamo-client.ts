import {
  DynamoDBClient,
  QueryCommand,
  DeleteItemCommand,
  AttributeValue,
  QueryCommandInput,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  PutCommandInput,
  UpdateCommandInput,
  GetCommandInput,
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

function filterItem(item?: Record<string, unknown>) {
  if (!item) return null;
  const { PK: _PK, SK: _SK, ...filteredItem } = item;
  return filteredItem;
}
function parseItem(item?: Record<string, AttributeValue>) {
  if (!item) return null;
  return filterItem(unmarshall(item));
}

export async function get(pkType: PkType, key: string, itemId?: string) {
  const commandObj: GetCommandInput = {
    TableName: config.dynamoAccountTableName,
    Key: { PK: `${pkType}#${key}`, SK: itemId ?? defaultSk },
  }
  const result = await db.send(
    new GetCommand(commandObj)
  );
  return filterItem(result.Item);
}

export async function query(pkType: PkType, key: string, itemId?: string, filters?:{[key:string]:string}) {
  const commandObj: QueryCommandInput = {
    TableName: config.dynamoAccountTableName,
    KeyConditionExpression: `PK = :pk AND SK = :sk`,
    ExpressionAttributeValues: {
      ":pk": { S: `${pkType}#${key}` },
      ":sk": { S: itemId ?? defaultSk },
    },
  }
  if (filters) {
    commandObj.FilterExpression = Object.keys(filters).map((key) => `${key} = :${key}`).join(" AND ");
    commandObj.ExpressionAttributeValues = {...commandObj.ExpressionAttributeValues, ...Object.fromEntries(Object.entries(filters).map(([key, value]) => [`:${key}`, { S: value }]))}
  }
  const result = await db.send(
    new QueryCommand(commandObj)
  );
  return result.Items?.map(parseItem)
}

export async function getRange(
  pkType: PkType,
  keyPrefix: string
): Promise<unknown[] | undefined> {
  const prefixExpression = ":keyPrefix";
  const commandObj: QueryCommandInput = {
    TableName: config.dynamoAccountTableName,
    KeyConditionExpression: `PK = ${prefixExpression}`,
    ExpressionAttributeValues: {
      [prefixExpression]: { S: `${pkType}#${keyPrefix}` },
    },
  }
  const result = await db.send(
    new QueryCommand(commandObj)
  );
  return result.Items?.map(parseItem);
}

export async function put(
  pkType: PkType,
  key: string,
  item: object,
  itemId?: string,
  returnItem: boolean = false
) {
  const PK = `${pkType}#${key}`;
  const SK = itemId ?? defaultSk;
  const commandObj: PutCommandInput = {
    TableName: config.dynamoAccountTableName,
    Item: { PK, SK, ...item },
  };
  await db.send(new PutCommand(commandObj));
  if (returnItem) {
    const getCommandObj: GetCommandInput = {
      TableName: config.dynamoAccountTableName,
      Key: { PK, SK },
    };
    const item = await db.send(new GetCommand(getCommandObj));
    return filterItem(item.Item);
  }
  return;
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
  return await db.send(
    new DeleteItemCommand({
      TableName: config.dynamoAccountTableName,
      Key: {
        PK: { S: `${pkType}#${key}` },
        SK: { S: itemId ?? defaultSk },
      },
    })
  );
}
