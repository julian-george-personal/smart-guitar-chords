import { z } from "zod";
import {
  TCreateSongRequest,
  TCreateSongResponse,
  TDeleteSongRequest,
  TGetSongsResponse,
  TUpdateSongRequest,
  TUpdateSongResponse,
} from "./song-requests";
import * as songRepository from "./song-repository";
import { songIdLength } from "./song-store";

export enum SongStatus {
  Success,
  InvalidRequest,
  Unauthorized,
  NotFound,
  UnknownError,
}

const maxJsonBytes = 2000;

export enum SongErrors {
  SongJsonInvalidFormat = "Song data must be valid JSON with all required fields",
  SongJsonTooLong = `JSONified song data must be ${maxJsonBytes} or less`,
  SongIdInvalidFormat = "A song ID is required",
  SongIdInvalidLength = `A song ID's length must be ${songIdLength}`,
}

function validateSongJson(songJson: string) {
  const song = JSON.parse(songJson);
  const requiredFields = new Set([
    "tabs",
    "title",
    "fretCount",
    "startingFretNum",
    "stringTunings",
    "chordNames",
  ]);
  const songFields = new Set(Object.keys(song));
  if (songFields.intersection(requiredFields).size != requiredFields.size) {
    throw new Error("Song data doesn't have the required set of fields");
  }
  if (song.title.length == 0) {
    throw new Error("Song title can't be empty");
  }
  return songJson;
}

const songSchema = z.object({
  songJson: z
    .string({ message: SongErrors.SongJsonInvalidFormat })
    .max(maxJsonBytes)
    .transform((str, ctx) => {
      // TODO: add validation here that the JSON has all the required song properties (title, tab, etc)
      try {
        validateSongJson(str);
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: SongErrors.SongJsonInvalidFormat,
        });
        return z.NEVER;
      }
    }),
  songId: z
    .string({ message: SongErrors.SongIdInvalidFormat })
    .length(songIdLength, { message: SongErrors.SongIdInvalidLength }),
});

export async function updateSong(
  request: TUpdateSongRequest,
  username: string
): Promise<[SongStatus, SongErrors | null]> {
  const { success, error } = songSchema.safeParse(request);
  if (!success) {
    if (!error) {
      throw new Error();
    }
    return [SongStatus.InvalidRequest, error.errors[0].message as SongErrors];
  }
  const result = await songRepository.updateSong(username, {
    songId: request.songId,
    songJson: request.songJson,
  });
  return [SongStatus.Success, null];
}

const createSongSchema = songSchema.omit({ songId: true });

export async function createSong(
  request: TCreateSongRequest,
  username: string
): Promise<[TCreateSongResponse | null, SongStatus, SongErrors | null]> {
  const { success, error } = createSongSchema.safeParse(request);
  if (!success) {
    if (!error) {
      throw new Error();
    }
    return [
      null,
      SongStatus.InvalidRequest,
      error.errors[0].message as SongErrors,
    ];
  }
  const songId = await songRepository.createSong(username, {
    songJson: request.songJson,
  });
  return [{ songId } as TCreateSongResponse, SongStatus.Success, null];
}

const deleteSongSchema = songSchema.omit({ songJson: true });

export async function deleteSong(
  request: TDeleteSongRequest,
  username: string
): Promise<[SongStatus, SongErrors | null]> {
  const { success, error } = deleteSongSchema.safeParse(request);
  if (!success) {
    if (!error) {
      throw new Error();
    }
    return [SongStatus.InvalidRequest, error.errors[0].message as SongErrors];
  }
  await songRepository.deleteSong(username, request.songId);
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
