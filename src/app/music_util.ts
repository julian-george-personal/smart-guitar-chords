import { Note, Chord, Interval } from "tonal";

export function getNumFrets(baseNote: string, currNote: string | null) {
  if (currNote == null) return null;
  return Number(Interval.semitones(Note.distance(baseNote, currNote)));
}

export function getNotesFromChordName(chordName: string) {
  return Chord.get(chordName).notes;
}

export function getChordNotesPerString(
  chordName: string,
  stringTunings: string[]
) {
  const notes = getNotesFromChordName(chordName);
  const stringNotes: string[] = [];
  let note_idx = 0;
  stringTunings.forEach((base) => {
    stringNotes.push(notes[note_idx]);
    note_idx++;
    if (note_idx >= notes.length) {
      note_idx = 0;
    }
  });
  return stringNotes;
}
