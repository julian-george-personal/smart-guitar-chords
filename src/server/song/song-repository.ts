import { randomUUIDv7 } from "bun";
import * as songStore from "./song-store";
import { TSong, songIdLength } from "./song-store";

export async function createSong(
  username: string,
  song: Omit<TSong, "songId">
) {
  const songId = randomUUIDv7().replaceAll("-", "").slice(0, songIdLength);
  return (await songStore.putSong(username, { ...song, songId }, true))?.songId;
}

export async function updateSong(username: string, song: TSong) {
  return await songStore.putSong(username, song);
}

export async function deleteSong(username: string, songId: string) {
  return await songStore.deleteSong(username, songId);
}

export async function getSongsByUser(username: string) {
  return await songStore.getSongsByUser(username);
}
