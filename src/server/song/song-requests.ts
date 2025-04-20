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
