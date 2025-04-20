import { randomUUIDv7 } from "bun";
import * as songStore from "./song-store";
import { TSong } from "./song-store";

export async function createSong(
  username: string,
  song: Omit<TSong, "songId">
) {
  const songId = randomUUIDv7().replaceAll("-", "").slice(12);
  return await songStore.putSong(username, { ...song, songId });
}

export async function getSongsByUser(username: string) {
  return await songStore.getSongsByUser(username);
}
