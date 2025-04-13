import * as dynamoClient from "../clients/dynamo-client";
import { PkType } from "../clients/dynamo-client";

export type TSongs = {
  songListJson: string;
};

export async function putSongs(username: string, songs: TSongs) {
  return await dynamoClient.put(PkType.Songs, username, songs);
}

export async function getSongs(username: string) {
  return await dynamoClient.get(PkType.Songs, username);
}
