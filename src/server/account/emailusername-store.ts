import * as dynamoClient from "../clients/dynamo-client";
import { PkType } from "../clients/dynamo-client";

export type TEmailUsername = {
  username: string;
};

export async function getEmailUsername(email: string) {
  return (await dynamoClient.get(PkType.EmailUsername, email)) as
    | TEmailUsername
    | undefined;
}

export async function putEmailUsername(
  email: string,
  emailUsername: TEmailUsername
) {
  return (await dynamoClient.put(
    PkType.EmailUsername,
    email,
    emailUsername
  )) as TEmailUsername | undefined;
}
