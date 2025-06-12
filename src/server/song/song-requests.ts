import { TSong } from "./song-store";

export type TGetSongsRequest = {
  username: string;
};

export type TGetSongsResponse = {
  songs: TSong[];
};

export type TCreateSongRequest = {
  songJson: string;
};

export type TCreateSongResponse = {
  songId: string;
  songJson: string;
};

export type TUpdateSongRequest = {
  songId: string;
  songJson: string;
};

export type TUpdateSongResponse = {
  songId: string;
  songJson: string;
};

export type TDeleteSongRequest = {
  songId: string;
};

export type TDuplicateSongRequest = {
  songId: string;
};

export type TDuplicateSongResponse = {
  songId: string;
};
