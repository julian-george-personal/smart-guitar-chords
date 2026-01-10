import { TSong, TChord } from "./song-types";
import { generateId } from "../../util";

export function migrateLegacySong(song: any): TSong {
  // If already in new format, return as-is
  if (song.chords && !song.tabs && !song.chordNames) {
    return song as TSong;
  }

  // Migrate from old format
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
