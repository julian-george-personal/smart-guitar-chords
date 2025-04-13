import * as dynamoClient from "../clients/dynamo-client";
import { PkType } from "../clients/dynamo-client";

export type TAccountInfo = {
  username: string;
  hashedPassword: string;
  email: string;
};

export async function getAccountInfo(username: string) {
  return (await dynamoClient.get(PkType.AccountInfo, username)) as
    | TAccountInfo
    | undefined;
}

export async function putAccountInfo(
  username: string,
  accountInfo: TAccountInfo,
  returnItem: boolean = false
) {
  return (await dynamoClient.put(
    PkType.AccountInfo,
    username,
    accountInfo,
    returnItem
  )) as TAccountInfo | undefined;
}

export async function updateAccountInfo(
  username: string,
  accountInfoUpdates: Partial<TAccountInfo>,
  returnItem: boolean = false
) {
  return (await dynamoClient.update(
    PkType.AccountInfo,
    username,
    accountInfoUpdates,
    returnItem
  )) as TAccountInfo | undefined;
}
