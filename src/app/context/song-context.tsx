import { NoteLiteral } from "tonal";
import { ChordTab, sanitizeChordName } from "../music_util";
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
  chordName: string;
  manualStringNotes: ChordTab;
  fretCount?: number;
  startingFretNum?: number;
  stringTunings?: NoteLiteral[];
};

export type TSong = {
  tabs: TTab[];
  title?: string;
  fretCount: number;
  startingFretNum: number;
  stringTunings: NoteLiteral[];
};

type TSongContext = {
  song: TSong;
  setTitle: (title: string) => void;
  setChordNames: Dispatch<SetStateAction<string[]>>;
  updateTabByKey: (key: number, newTab: TTab) => void;
  setSongStartingFretNum: (startingFretNum: number) => void;
  setSongFretCount: (fretCount: number) => void;
  setSongStringTunings: (stringTunings: NoteLiteral[]) => void;
};

const SongContext = createContext<TSongContext | null>(null);

interface SongProviderProps {
  children: ReactNode;
}

const defaultStringTunings: NoteLiteral[] = ["E", "A", "D", "G", "B", "E"];
const defaultFretCount = 5;
const defaultStartingFretNum = 0;

export function SongProvider({ children }: SongProviderProps) {
  const [chordNames, setChordNames] = useState<string[]>(["C"]);
  const [song, setSong] = useState<TSong>({
    tabs: [],
    startingFretNum: defaultStartingFretNum,
    fretCount: defaultFretCount,
    stringTunings: defaultStringTunings,
  });

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
            newSong.tabs.push({ chordName: chords[i], manualStringNotes: {} });
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
  const setSongStartingFretNum = useCallback(
    (startingFretNum: number) =>
      setSong((prev) => ({ ...prev, startingFretNum })),
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
  useEffect(() => {
    setChords(chordNames.map(sanitizeChordName));
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
        setSongStartingFretNum,
        setSongFretCount,
        setSongStringTunings,
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

  const tab = useMemo(
    () =>
      ({
        ...song.tabs[key],
        ...{
          fretCount: song.fretCount,
          // TODO this is probably a gross way to do this. inputted data and displayed data shouldnt be the same
          stringTunings: song.stringTunings.filter((s) => s !== ""),
          startingFretNum: song.startingFretNum,
        },
      } as Required<TTab>),
    [
      song.tabs[key].chordName,
      song.tabs[key].manualStringNotes,
      song.fretCount,
      song.stringTunings,
      song.startingFretNum,
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
