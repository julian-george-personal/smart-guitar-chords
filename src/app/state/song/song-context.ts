import { createContext } from "react";
import { NoteLiteral } from "tonal";
import { StoreResponse } from "../store";
import { TChord, TSong, TTab } from "./song-types";

type TSongContext = {
  song: TSong;
  songId?: string;
  selectSong: (songId: string) => void;
  setTitle: (title: string) => void;
  updateChords: (
    chords: Record<string, Partial<TChord> & Pick<TChord, "id">>
  ) => void;
  updateTabById: (key: string, setter: (prev: TTab) => Partial<TTab>) => void;
  setSongCapoFretNum: (capoFretNum: number) => void;
  setSongFretCount: (fretCount: number) => void;
  setSongStringTunings: (stringTunings: NoteLiteral[]) => void;
  saveSong: (
    updates: Partial<TSong>
  ) => Promise<StoreResponse & { songId?: string }>;
  deleteCurrentSong: () => Promise<StoreResponse>;
  duplicateCurrentSong: () => Promise<StoreResponse & { songId?: string }>;
  undoUnsavedChanges: () => void;
  isLoading: boolean;
  isCurrentSongUnsaved: boolean;
  unsavedSongIds: Set<string>;
};

export const SongContext = createContext<TSongContext | null>(null);
