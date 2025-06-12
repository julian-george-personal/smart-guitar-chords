import axios, { AxiosResponse } from "axios";
import { TSong } from "../context/song-context";
import { apiUrl, authHeaders, StoreResponse, toStoreResponse } from "./store";

const songUrl = apiUrl + "/song";

type GetSongsResponse = {
  songs: SongData[] | null;
};

type CreateSongResponse = {
  songId?: string;
};

type UnparsedSongData = { songId: string; songJson: string };

export type SongData = { songId: string; song: TSong };

export async function getSongs(): Promise<GetSongsResponse & StoreResponse> {
  try {
    const result = await axios.get<{ songs: UnparsedSongData[] }>(
      songUrl + "/user",
      authHeaders()
    );
    const parsedResult = result.data.songs.map((unparsedSongData) => ({
      songId: unparsedSongData.songId,
      song: JSON.parse(unparsedSongData.songJson) as TSong,
    }));
    return { songs: parsedResult, isError: false };
  } catch (e) {
    return { ...toStoreResponse(e), songs: null };
  }
}

export async function createSong(
  songJson: string
): Promise<CreateSongResponse & StoreResponse> {
  try {
    const result = await axios.post<
      { songJson: string },
      AxiosResponse<CreateSongResponse>
    >(songUrl + "/create", { songJson }, authHeaders());
    return { songId: result.data.songId, isError: false };
  } catch (e) {
    return toStoreResponse(e);
  }
}

export async function updateSong(
  songId: string,
  songJson: string
): Promise<StoreResponse> {
  try {
    await axios.post(
      songUrl + "/update/" + songId,
      { songJson },
      authHeaders()
    );
    return { isError: false };
  } catch (e) {
    return toStoreResponse(e);
  }
}

export async function deleteSong(songId: string): Promise<StoreResponse> {
  try {
    await axios.delete(songUrl + "/delete/" + songId, authHeaders());
    return { isError: false };
  } catch (e) {
    return toStoreResponse(e);
  }
}

export async function duplicateSong(
  songId: string
): Promise<CreateSongResponse & StoreResponse> {
  try {
    const result = await axios.post<{}, AxiosResponse<CreateSongResponse>>(
      songUrl + "/duplicate/" + songId,
      {},
      authHeaders()
    );
    return { songId: result.data.songId, isError: false };
  } catch (e) {
    return toStoreResponse(e);
  }
}
