import { TGetSongsResponse } from "./songs-requests";
import * as songsRepository from "./songs-repository";

export enum SongsStatus {
  Success,
  InvalidRequest,
  Unauthorized,
  UnknownError,
}

export async function getSongs(
  username: string | null
): Promise<[TGetSongsResponse | null, SongsStatus]> {
  if (!username) {
    return [null, SongsStatus.Unauthorized];
  }
  const songs = await songsRepository.getSongs(username);
  if (!songs) {
    return [null, SongsStatus.UnknownError];
  }
  const { songListJson } = songs;
  return [{ songListJson }, SongsStatus.Success];
}
