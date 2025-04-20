import { z } from "zod";
import { TCreateSongRequest, TGetSongsResponse } from "./song-requests";
import * as songRepository from "./song-repository";

export enum SongStatus {
  Success,
  InvalidRequest,
  Unauthorized,
  NotFound,
  UnknownError,
}

const maxJsonBytes = 2000;

export enum SongErrors {
  SongJsonInvalidFormat = "Valid JSONified song data is required",
  SongJsonTooLong = `JSONified song data must be ${maxJsonBytes} or less`,
}

const songSchema = z.object({
  songJson: z
    .string({ message: SongErrors.SongJsonInvalidFormat })
    .max(maxJsonBytes)
    .transform((str, ctx) => {
      try {
        return JSON.parse(str);
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: SongErrors.SongJsonInvalidFormat,
        });
        return z.NEVER;
      }
    }),
});

export async function createSong(
  request: TCreateSongRequest,
  username: string
): Promise<[SongStatus, SongErrors | null]> {
  const { success, error } = songSchema.safeParse(request);
  if (!success) {
    if (!error) {
      throw new Error();
    }
    return [SongStatus.InvalidRequest, error.errors[0].message as SongErrors];
  }
  await songRepository.createSong(username, { songJson: request.songJson });
  return [SongStatus.Success, null];
}

export async function getSongsByUser(
  username: string
): Promise<[TGetSongsResponse | null, SongStatus]> {
  const songs = await songRepository.getSongsByUser(username);
  if (!songs) {
    return [null, SongStatus.NotFound];
  }
  return [{ songs }, SongStatus.Success];
}
