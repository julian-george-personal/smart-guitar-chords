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
  
    // NOTE: whenever you add a property to TTab, you need to change this
    const currentTabData = song.tabs[key];
    const startingFretNum = currentTabData?.startingFretNum;
    const voicingIdx = currentTabData?.voicingIdx;
    const voicesChord = currentTabData?.voicesChord;
    const fretCount = song.fretCount;
    const stringTunings = song.stringTunings;
    const capoFretNum = song.capoFretNum;
  
    // Memoize the filtered stringTunings to prevent new array references on every render
    const filteredStringTunings = useMemo(
      () => stringTunings.filter((s) => s !== ""),
      [stringTunings]
    );
  
    const tab = useMemo(
      () =>
      ({
        ...currentTabData,
        ...{
          fretCount,
          // TODO this is probably a gross way to do this. inputted data and displayed data shouldnt be the same
          stringTunings: filteredStringTunings,
          capoFretNum,
          startingFretNum,
          voicingIdx,
          voicesChord,
        },
      } as Required<TTab>),
      [
        startingFretNum,
        voicingIdx,
        voicesChord,
        fretCount,
        filteredStringTunings,
        capoFretNum,
        currentTabData,
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
          if (prev.voicesChord === newValue) return prev;
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
  