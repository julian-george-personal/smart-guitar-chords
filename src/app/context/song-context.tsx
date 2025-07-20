import { NoteLiteral } from "tonal";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { ChordTab } from "../logic/music_util";
import * as songStore from "../store/song-store";
import { StoreResponse } from "../store/store";
import { useAccountData } from "./account-context";
import { withLoading } from "../util";

export type TTab = {
  chordName: string;
  manualStringNotes: ChordTab;
  fretCount: number;
  startingFretNum: number;
  capoFretNum: number;
  voicingIdx: number;
  // These include octave nums, but they're relative. i.e. on the high E string in standard tuning, F1 is fret 1 and F2 is fret 13
  stringTunings: NoteLiteral[];
  voicesChord: boolean;
};

export type TSong = {
  tabs: TTab[];
  title?: string;
  fretCount: number;
  capoFretNum: number;
  stringTunings: NoteLiteral[];
  chordNames: string[];
};

type TSongContext = {
  song: TSong;
  songId?: string;
  selectSong: (songId: string) => void;
  setTitle: (title: string) => void;
  setChordNames: (chordNames: string[]) => void;
  updateTabByKey: (key: number, newTab: TTab) => void;
  setSongCapoFretNum: (capoFretNum: number) => void;
  setSongFretCount: (fretCount: number) => void;
  setSongStringTunings: (stringTunings: NoteLiteral[]) => void;
  saveSong: (
    updates: Partial<TSong>
  ) => Promise<StoreResponse & { songId?: string }>;
  deleteCurrentSong: () => Promise<StoreResponse>;
  duplicateCurrentSong: () => Promise<StoreResponse & { songId?: string }>;
  isLoading: boolean;
};

const SongContext = createContext<TSongContext | null>(null);

interface SongProviderProps {
  children: ReactNode;
}

const defaultStringTunings: NoteLiteral[] = ["E1", "A1", "D1", "G1", "B1", "E1"];
const defaultFretCount = 5;
const defaultCapoFretNum = 0;
const defaultStartingFretNum = 0;
const defaultSong: TSong = {
  chordNames: ["C"],
  tabs: [],
  capoFretNum: defaultCapoFretNum,
  fretCount: defaultFretCount,
  stringTunings: defaultStringTunings,
};
const defaultTab: TTab = {
  chordName: defaultSong.chordNames[0],
  manualStringNotes: {},
  fretCount: defaultFretCount,
  stringTunings: defaultStringTunings,
  capoFretNum: defaultCapoFretNum,
  startingFretNum: defaultStartingFretNum,
  voicingIdx: 0,
  voicesChord: true,
};

export function SongProvider({ children }: SongProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [song, setSong] = useState<TSong>(defaultSong);
  const [songId, setSongId] = useState<string | undefined>();
  const { songs, refreshSongs } = useAccountData();

  const withSongLoading = useCallback(withLoading(setIsLoading), [
    setIsLoading,
  ]);

  useEffect(() => {
    if (!songId || !songs?.[songId]) {
      setSong(defaultSong);
      return;
    }
    setSong(songs[songId]);
  }, [songId, songs, setSong]);

  const setTitle = useCallback(
    (newTitle: string) => {
      setSong((prev) => ({ ...prev, title: newTitle }));
    },
    [setSong]
  );

  const setChordNames = useCallback(
    (chordNames: string[]) => setSong((prev) => ({ ...prev, chordNames })),
    [setSong]
  );

  useEffect(() => {
    setSong((prev) => {
      const newSong = { ...prev };
      for (let i = 0; i < prev.chordNames.length; i++) {
        if (i >= newSong.tabs.length) {
          newSong.tabs.push({
            ...defaultTab,
            chordName: prev.chordNames[i],
          });
        } else {
          newSong.tabs[i].chordName = prev.chordNames[i];
        }
      }
      // Delete any chords that no longer exist
      newSong.tabs = newSong.tabs.slice(0, prev.chordNames.length);
      return newSong;
    });
  }, [song.chordNames]);

  const setSongCapoFretNum = useCallback(
    (capoFretNum: number) => setSong((prev) => ({ ...prev, capoFretNum })),
    [setSong]
  );

  const setSongFretCount = useCallback(
    (fretCount: number) => setSong((prev) => ({ ...prev, fretCount })),
    [setSong]
  );

  const setSongStringTunings = useCallback(
    (stringTunings: NoteLiteral[]) =>
      setSong((prev) => ({ ...prev, stringTunings })),
    [setSong]
  );

  const saveSong = useCallback(
    async (updates: Partial<TSong>) => {
      const newSong = { ...song, ...updates };
      const songJson = JSON.stringify(newSong);
      let response: StoreResponse & { songId?: string };
      if (songId) {
        response = await songStore.updateSong(songId, songJson);
      } else {
        response = await songStore.createSong(songJson);
      }
      refreshSongs();
      if (response.songId) setSongId(response.songId);
      return response;
    },
    [song, songId, setSong, refreshSongs]
  );

  const deleteCurrentSong = useCallback(async () => {
    if (!songId) throw new Error();
    let response = await songStore.deleteSong(songId);
    refreshSongs();
    return response;
  }, [song, songId]);

  const duplicateCurrentSong = useCallback(async () => {
    if (!songId) throw new Error();
    const response = await songStore.duplicateSong(songId);
    refreshSongs();
    if (response.songId) {
      setSongId(response.songId);
    }
    return response;
  }, [songId, refreshSongs]);

  const updateTabByKey = useCallback(
    (key: number, changes: Partial<TTab>) => {
      setSong((prev) => {
        return {
          ...prev,
          tabs: prev.tabs.map((prevTab, i) =>
            key == i ? { ...prevTab, ...changes } : prevTab
          ),
        };
      });
    },
    [setSong]
  );

  return (
    <SongContext.Provider
      value={{
        song,
        songId,
        selectSong: setSongId,
        setTitle,
        setChordNames,
        updateTabByKey,
        setSongCapoFretNum,
        setSongFretCount,
        setSongStringTunings,
        saveSong: withSongLoading(saveSong),
        deleteCurrentSong: withSongLoading(deleteCurrentSong),
        duplicateCurrentSong: withSongLoading(duplicateCurrentSong),
        isLoading,
      }}
    >
      {children}
    </SongContext.Provider>
  );
}

export const useSongData = () => {
  const context = useContext(SongContext);
  if (context === null) {
    throw new Error("SongContext is null");
  }
  return context;
};

export function useTabByKey(key: number) {
  const { song, updateTabByKey } = useSongData();

  // NOTE: whenever you add a property to TTab, you need to change this
  const tab = useMemo(
    () =>
    ({
      ...song.tabs[key],
      ...{
        fretCount: song.fretCount,
        // TODO this is probably a gross way to do this. inputted data and displayed data shouldnt be the same
        stringTunings: song.stringTunings.filter((s) => s !== ""),
        capoFretNum: song.capoFretNum,
        startingFretNum: song.tabs[key].startingFretNum,
        voicingIdx: song.tabs[key].voicingIdx,
        voicesChord: song.tabs[key].voicesChord,
      },
    } as Required<TTab>),
    [
      song.tabs[key].chordName,
      song.tabs[key].manualStringNotes,
      song.tabs[key].startingFretNum,
      song.tabs[key].voicingIdx,
      song.tabs[key].voicesChord,
      song.fretCount,
      song.stringTunings,
      song.capoFretNum,
    ]
  );
  const updateTab = useCallback(
    (setter: (prev: TTab) => TTab) => {
      updateTabByKey(key, setter(tab));
    },
    [updateTabByKey, tab]
  );
  const setManualStringNote = useCallback(
    (stringIdx: number, note: NoteLiteral | null) => {
      updateTab((prev) => ({
        ...prev,
        manualStringNotes: {
          ...prev.manualStringNotes,
          [stringIdx]: note,
        },
      }));
    },
    [updateTab]
  );
  const resetManualStringNote = useCallback(
    (stringIdx: number) => {
      updateTab((prev) => {
        const newManualStringNotes = { ...prev.manualStringNotes };
        delete newManualStringNotes[stringIdx];
        return { ...prev, manualStringNotes: newManualStringNotes };
      });
    },
    [updateTab]
  );
  const resetAllManualStringNotes = useCallback(() => {
    updateTab((prev) => ({ ...prev, manualStringNotes: {} }));
  }, [updateTab]);
  const setStartingFretNum = useCallback(
    (newStartingFretNum: number) => {
      updateTab((prev) => ({ ...prev, startingFretNum: newStartingFretNum }));
    },
    [updateTab]
  );
  const incrementStartingFretNum = useCallback(
    (fretDiff: number) =>
      updateTab((prev) => {
        return prev.startingFretNum != null
          ? { ...prev, startingFretNum: prev.startingFretNum + fretDiff }
          : prev;
      }),
    [updateTab]
  );
  const resetVoicingIdx = useCallback(() => {
    updateTab((prev) => {
      return {
        ...prev,
        voicingIdx: 0
      };
    });
  }, [updateTab])
  const incrementVoicingIdx = useCallback(
    (idxDiff: number, numVoicingOptions: number) => {
      updateTab((prev) => {
        return {
          ...prev,
          voicingIdx: Math.min(
            Math.max(prev.voicingIdx + idxDiff, 0),
            numVoicingOptions - 1
          ),
        };
      });
    },
    [updateTab]
  );
  const setVoicesChord = useCallback(
    (newValue: boolean) =>
      updateTab((prev) => {
        return { ...prev, voicesChord: newValue };
      }),
    [updateTab]
  );
  return {
    tab,
    setManualStringNote,
    resetManualStringNote,
    setStartingFretNum,
    resetAllManualStringNotes,
    incrementStartingFretNum,
    resetVoicingIdx,
    incrementVoicingIdx,
    setVoicesChord,
  };
}
