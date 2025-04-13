import * as songsStore from "./songs-store";

export async function putNewSongs(username: string) {
  return await songsStore.putSongs(username, {
    songListJson: JSON.stringify([]),
  });
}

export async function getSongs(username: string) {
  return await songsStore.getSongs(username);
}
