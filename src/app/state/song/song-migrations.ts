import { TSong, TChord } from "./song-types";
import { generateId } from "../../util";

export function migrateLegacySong(song: any): TSong {
  // If already in new format (chords is an object, not an array), return as-is
  if (song.chords && !Array.isArray(song.chords) && !song.tabs && !song.chordNames) {
    return song as TSong;
  }

  // Handle case where chords is an array (needs migration to object)
  if (song.chords && Array.isArray(song.chords)) {
    const chords: Record<string, TChord> = {};
    song.chords.forEach((chord: TChord) => {
      chords[chord.id] = chord;
    });
    const { chords: _chords, ...rest } = song;
    return { ...rest, chords } as TSong;
  }

  // Migrate from old format (chordNames/tabs)
  const chordNames = song.chordNames || [];
  const tabs = song.tabs || [];

  const chords: Record<string, TChord> = {};
  chordNames.forEach((chordName: string, index: number) => {
    const id = generateId();
    chords[id] = {
      id,
      chordName,
      index,
      tab: tabs[index] || undefined,
    };
  });

  // Remove old properties and add new ones
  const { tabs: _tabs, chordNames: _chordNames, ...rest } = song;
  return { ...rest, chords } as TSong;
}
