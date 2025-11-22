import { NoteLiteral } from "tonal";
import {
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import deepEqual from 'fast-deep-equal';
import * as songStore from "./song-store";
import { StoreResponse } from "../store";
import { withLoading } from "../../util";
import { useAccountData } from "../account/account-hooks";
import { TChord, TSong, TTab } from "./song-types";
import { SongContext } from "./song-context";

interface SongProviderProps {
  children: ReactNode;
}

const defaultStringTunings: NoteLiteral[] = ["E1", "A1", "D1", "G1", "B1", "E1"];
const defaultFretCount = 5;
const defaultCapoFretNum = 0;
const defaultStartingFretNum = 0;
const defaultChordName = "C"
const defaultTab: TTab = {
  chordName: defaultChordName,
  manualStringNotes: {},
  fretCount: defaultFretCount,
  stringTunings: defaultStringTunings,
  capoFretNum: defaultCapoFretNum,
  startingFretNum: defaultStartingFretNum,
  voicingIdx: 0,
  voicesChord: true,
};
const defaultSong: TSong = {
  chords: [{ id: "default0", chordName: defaultChordName, index: 0, tab: defaultTab }],
  capoFretNum: defaultCapoFretNum,
  fretCount: defaultFretCount,
  stringTunings: defaultStringTunings,
};

export function SongProvider({ children }: SongProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [song, setSong] = useState<TSong>(defaultSong);
  const [songId, setSongId] = useState<string | undefined>();
  const [songs, setSongs] = useState<{ [songId: string]: TSong }>({});
  const { songs: savedSongs, refreshSongs } = useAccountData();

  const isCurrentSongUnsaved = useMemo(() => {
    if (!songId && !deepEqual(song, defaultSong)) {
      return true;
    }
    if (songId && !deepEqual(song, savedSongs[songId])) {
      return true;
    }
    return false;
  },
    // Omit songId because we only want to rerender once the song itself has changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [song, savedSongs]);

  const unsavedSongIds = useMemo(() => {
    const unsaved = new Set<string>();

    Object.keys(songs).forEach((id) => {
      if (!deepEqual(songs[id], savedSongs[id])) {
        unsaved.add(id);
      }
    });

    if (songId && isCurrentSongUnsaved) {
      unsaved.add(songId);
    }

    return unsaved;

  },
    // Omit songId because we only want to rerender once the song itself has changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [songs, savedSongs, isCurrentSongUnsaved]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const withSongLoading = useCallback(withLoading(setIsLoading), [
    setIsLoading,
  ]);

  useEffect(() => {
    setSongs(structuredClone(savedSongs));
  }, [savedSongs, setSongs]);

  useEffect(() => {
    if (!songId || !savedSongs?.[songId]) {
      setSong(defaultSong);
      return;
    }
    setSong(songs[songId]);
  }, [songId, savedSongs, setSong, songs]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedSongIds.size > 0 || isCurrentSongUnsaved) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unsavedSongIds, isCurrentSongUnsaved]);

  const selectSong = useCallback((newSongId: string) => {
    if (songId) setSongs((prev) => ({ ...prev, [songId]: song }));
    setSongId(newSongId);
  }, [setSongId, setSongs, song, songId]);

  const setTitle = useCallback(
    (newTitle: string) => {
      setSong((prev) => ({ ...prev, title: newTitle }));
    },
    [setSong]
  );

  const updateChords = useCallback(
    (chords: (Partial<TChord> & Pick<TChord, "id">)[]) => {
      setSong((prev) => {
        // Merge incoming chords with existing chords to preserve tab data
        const mergedChords = chords.map(chord => {
          const existingChord = prev.chords.find(c => c.id === chord.id);
          return existingChord
            ? { ...existingChord, ...chord }
            : chord;
        });
        return { ...prev, chords: mergedChords as TChord[] };
      });
    },
    [setSong]
  );

  useEffect(() => {
    setSong((prev) => {
      // Safety check in case prev is undefined
      if (!prev || !prev.chords) {
        return prev;
      }

      let hasChanges = false;
      const updatedChords = prev.chords.map((chord) => {
        if (!chord.tab) {
          hasChanges = true;
          return {
            ...chord,
            tab: {
              ...defaultTab,
              chordName: chord.chordName,
            },
          };
        }
        // Update tab's chordName if chord's chordName changed
        if (chord.tab.chordName !== chord.chordName) {
          hasChanges = true;
          return {
            ...chord,
            tab: {
              ...chord.tab,
              chordName: chord.chordName,
            },
          };
        }
        return chord;
      });

      // Only update if something actually changed
      if (hasChanges) {
        return { ...prev, chords: updatedChords };
      }
      return prev;
    });
  }, [song?.chords]);

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
    [song, songId, refreshSongs]
  );

  const deleteCurrentSong = useCallback(async () => {
    if (!songId) throw new Error();
    const response = await songStore.deleteSong(songId);
    refreshSongs();
    return response;
  }, [songId, refreshSongs]);

  const duplicateCurrentSong = useCallback(async () => {
    if (!songId) throw new Error();
    const response = await songStore.duplicateSong(songId);
    refreshSongs();
    if (response.songId) {
      setSongId(response.songId);
    }
    return response;
  }, [songId, refreshSongs]);

  const undoUnsavedChanges = useCallback(() => {
    if (songId) setSong(savedSongs[songId])
  }, [songId, setSong, savedSongs])

  const updateTabByKey = useCallback(
    (key: number, changes: Partial<TTab>) => {
      setSong((prev) => {
        return {
          ...prev,
          chords: prev.chords.map((chord, i) => {
            if (key == i) {
              // Skip update if tab doesn't exist yet - it will be created by the useEffect
              if (!chord.tab) {
                return chord;
              }
              return { ...chord, tab: { ...chord.tab, ...changes } as TTab };
            }
            return chord;
          }),
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
        selectSong,
        setTitle,
        updateChords,
        updateTabByKey,
        setSongCapoFretNum,
        setSongFretCount,
        setSongStringTunings,
        saveSong: withSongLoading(saveSong),
        deleteCurrentSong: withSongLoading(deleteCurrentSong),
        duplicateCurrentSong: withSongLoading(duplicateCurrentSong),
        undoUnsavedChanges,
        isLoading,
        isCurrentSongUnsaved,
        unsavedSongIds
      }}
    >
      {children}
    </SongContext.Provider>
  );
}

