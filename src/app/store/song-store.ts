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
