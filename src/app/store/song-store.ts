import axios, { AxiosError } from "axios";
import { TSong } from "../context/song-context";
import {
  apiUrl,
  authHeaders,
  StoreResponse,
  UnknownErrorMessage,
} from "./store";

const songUrl = apiUrl + "/song";

type GetSongsResponse = {
  songs: SongData[] | null;
};

type UnparsedSongData = { songId: string; song: string };

export type SongData = { songId: string; song: TSong };

export async function getSongs(): Promise<GetSongsResponse & StoreResponse> {
  try {
    const result = await axios.get<UnparsedSongData[]>(
      songUrl + "/user",
      authHeaders
    );
    const parsedResult = result.data.map((unparsedSongData) => ({
      songId: unparsedSongData.songId,
      song: JSON.parse(unparsedSongData.song) as TSong,
    }));
    return { songs: parsedResult, isError: false };
  } catch (e) {
    return {
      songs: null,
      isError: true,
      errorMessage: e instanceof AxiosError ? e.message : UnknownErrorMessage,
    };
  }
}

export async function createSong(songJson: string): Promise<StoreResponse> {
  try {
    await axios.post(songUrl + "/create", { songJson }, authHeaders);
    return { isError: false };
  } catch (e) {
    return {
      isError: true,
      errorMessage: e instanceof AxiosError ? e.message : UnknownErrorMessage,
    };
  }
}

export async function updateSong(
  songId: string,
  songJson: string
): Promise<StoreResponse> {
  try {
    await axios.post(songUrl + "/update/" + songId, { songJson }, authHeaders);
    return { isError: false };
  } catch (e) {
    return {
      isError: true,
      errorMessage: e instanceof AxiosError ? e.message : UnknownErrorMessage,
    };
  }
}

export async function deleteSong(songId: string): Promise<StoreResponse> {
  try {
    await axios.delete(songUrl + "/delete/" + songId, authHeaders);
    return { isError: false };
  } catch (e) {
    return {
      isError: true,
      errorMessage: e instanceof AxiosError ? e.message : UnknownErrorMessage,
    };
  }
}
