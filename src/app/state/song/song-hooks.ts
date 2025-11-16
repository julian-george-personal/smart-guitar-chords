import { useContext, useMemo, useCallback } from "react";
import { NoteLiteral } from "tonal";
import { SongContext } from "./song-context";
import { TTab } from "./song-types";

export const useSongData = () => {
    const context = useContext(SongContext);
    if (context === null) {
      throw new Error("SongContext is null");
    }
    return context;
  };
  
export function useTabByKey(key: number) {
  const { song, updateTabByKey } = useSongData();

  // TODO its gross that we have to do this. inputted data and displayed data shouldnt be the same
  const filteredStringTunings = useMemo(
    () => song.stringTunings.filter((s) => s !== ""),
    [song.stringTunings]
  );

  const chordName = useMemo(()=>song.tabs[key].chordName, [key, song.tabs])
  const manualStringNotes = useMemo(()=>song.tabs[key].manualStringNotes, [key, song.tabs])
  const startingFretNum = useMemo(()=>song.tabs[key].startingFretNum, [key, song.tabs])
  const voicingIdx = useMemo(()=>song.tabs[key].voicingIdx, [key, song.tabs])
  const voicesChord = useMemo(()=>song.tabs[key].voicesChord, [key, song.tabs])

  // NOTE: whenever you add a property to TTab, you need to change this
  const tab = useMemo(
    () =>
    (
      {
        // we pull these two in here in case we ever want different tabs to have different fretCounts or capo frets
        fretCount: song.fretCount,
        capoFretNum: song.capoFretNum,
        stringTunings: filteredStringTunings,
        manualStringNotes,
        chordName,
        startingFretNum,
        voicingIdx,
        voicesChord,
      } as Required<TTab>),
    [
      song.fretCount,
      song.capoFretNum,
      chordName,
      manualStringNotes,
      startingFretNum,
      voicingIdx,
      voicesChord,
      filteredStringTunings
    ]
  );
  const updateTab = useCallback(
    (setter: (prev: TTab) => TTab) => {
      updateTabByKey(key, setter(tab));
    },
    [updateTabByKey, tab, key]
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
  