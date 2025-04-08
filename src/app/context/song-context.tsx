import { NoteLiteral } from "tonal";
import { ChordTab } from "../music_util";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";

export type TTab = {
  fretCount: number;
  chordName: string;
  startingFretNum: number;
  stringTunings: NoteLiteral[];
  manualStringNotes: ChordTab;
};

export type TSong = {
  title?: string;
  tabs: TTab[];
  defaultTab: TTab;
};

const DefaultStringTunings = ["E", "A", "D", "G", "B", "E"];

const DefaultTab: TTab = {
  fretCount: 5,
  chordName: "C",
  startingFretNum: 0,
  stringTunings: DefaultStringTunings,
  manualStringNotes: {},
};

type TSongContext = {
  song: TSong;
  setTitle: (title: string) => void;
  setChordNames: Dispatch<SetStateAction<string[]>>;
  updateTabByKey: (key: number, newTab: TTab) => void;
};

const SongContext = createContext<TSongContext | null>(null);

interface SongProviderProps {
  children: ReactNode;
}

export function SongProvider({ children }: SongProviderProps) {
  const [defaultTab, setDefaultTab] = useState<TTab>(DefaultTab);
  const [chordNames, setChordNames] = useState<string[]>(["C"]);
  const [song, setSong] = useState<TSong>({ tabs: [], defaultTab });

  const setTitle = useCallback(
    (newTitle: string) => {
      setSong((prev) => ({ ...prev, title: newTitle }));
    },
    [setSong]
  );
  const setChords = useCallback(
    (chords: string[]) => {
      setSong((prev) => {
        const newSong = { ...prev };
        for (let i = 0; i < chords.length; i++) {
          if (i >= newSong.tabs.length) {
            newSong.tabs.push({ ...DefaultTab, chordName: chords[i] });
          } else {
            newSong.tabs[i].chordName = chords[i];
          }
        }
        // Delete any chords that no longer exist
        newSong.tabs = newSong.tabs.slice(0, chords.length);
        return newSong;
      });
    },
    [setSong]
  );
  useEffect(() => {
    setChords(
      chordNames.map((chordName) => chordName.replace(/[^a-zA-G0-9#//]/g, ""))
    );
  }, [setChords, chordNames]);
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
        setTitle,
        setChordNames,
        updateTabByKey,
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
  const tab = useMemo(() => song.tabs[key], [song.tabs[key]]);
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
        delete prev.manualStringNotes[stringIdx];
        return prev;
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
  return {
    tab,
    setManualStringNote,
    resetManualStringNote,
    setStartingFretNum,
    resetAllManualStringNotes,
  };
}
