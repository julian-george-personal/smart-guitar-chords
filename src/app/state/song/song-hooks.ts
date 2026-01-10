import { useContext, useMemo, useCallback, useEffect } from "react";
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

export function useTabById(id: string) {
  const { song, updateTabById } = useSongData();

  // TODO its gross that we have to do this. inputted data and displayed data shouldnt be the same
  const filteredStringTunings = useMemo(
    () => song.stringTunings.filter((s) => s !== ""),
    [song.stringTunings]
  );

  const chordName = useMemo(
    () => song.chords[id]?.tab?.chordName,
    [id, song.chords]
  );
  const manualStringNotes = useMemo(
    () => song.chords[id]?.tab?.manualStringNotes,
    [id, song.chords]
  );
  const startingFretNum = useMemo(
    () => song.chords[id]?.tab?.startingFretNum,
    [id, song.chords]
  );
  const voicingIdx = useMemo(
    () => song.chords[id]?.tab?.voicingIdx,
    [id, song.chords]
  );
  const voicesChord = useMemo(
    () => song.chords[id]?.tab?.voicesChord,
    [id, song.chords]
  );

  // NOTE: whenever you add a property to TTab, you need to change this
  const tab = useMemo(
    () =>
      ({
        // we pull these two in here in case we ever want different tabs to have different fretCounts or capo frets
        fretCount: song.fretCount,
        capoFretNum: song.capoFretNum,
        stringTunings: filteredStringTunings,
        manualStringNotes: manualStringNotes || {},
        chordName,
        startingFretNum: startingFretNum || 0,
        voicingIdx: voicingIdx || 0,
        voicesChord: voicesChord ?? true,
      } as Required<TTab>),
    [
      song.fretCount,
      song.capoFretNum,
      chordName,
      manualStringNotes,
      startingFretNum,
      voicingIdx,
      voicesChord,
      filteredStringTunings,
    ]
  );

  const updateTab = useCallback(
    (setter: (prev: TTab) => Partial<TTab>) => {
      updateTabById(id, setter);
    },
    [updateTabById, id]
  );

  useEffect(() => {
    resetVoicingIdx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualStringNotes, chordName]);

  const setManualStringNote = useCallback(
    (stringIdx: number, note: NoteLiteral | null) => {
      updateTab((prev) => ({
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
        return { manualStringNotes: newManualStringNotes };
      });
    },
    [updateTab]
  );
  const resetAllManualStringNotes = useCallback(() => {
    updateTab(() => ({ manualStringNotes: {} }));
  }, [updateTab]);
  const setStartingFretNum = useCallback(
    (newStartingFretNum: number) => {
      updateTab(() => ({ startingFretNum: newStartingFretNum }));
    },
    [updateTab]
  );
  const incrementStartingFretNum = useCallback(
    (fretDiff: number) =>
      updateTab((prev) => {
        return prev.startingFretNum != null
          ? { startingFretNum: prev.startingFretNum + fretDiff }
          : {};
      }),
    [updateTab]
  );
  const resetVoicingIdx = useCallback(() => {
    updateTab(() => {
      return {
        voicingIdx: 0,
      };
    });
  }, [updateTab]);
  const incrementVoicingIdx = useCallback(
    (idxDiff: number, numVoicingOptions: number) => {
      updateTab((prev) => {
        return {
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
      updateTab(() => {
        return { voicesChord: newValue };
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
