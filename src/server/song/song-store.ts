import * as dynamoClient from "../clients/dynamo-client";
import { PkType } from "../clients/dynamo-client";

export type TSong = {
  songId: string;
  songJson: string;
};

export const songIdLength = 8;

export async function putSong(username: string, song: TSong) {
  return await dynamoClient.put(PkType.Song, username, song, song.songId);
}

export async function deleteSong(username: string, songId: string) {
  return await dynamoClient.remove(PkType.Song, username, songId);
}

export async function getSongsByUser(
  username: string
): Promise<TSong[] | null> {
  const result = await dynamoClient.getRange(PkType.Song, username);
  if (!result) return null;
  return result as TSong[];
}
