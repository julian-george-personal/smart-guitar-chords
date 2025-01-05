import { Note, Chord, Interval, note } from "tonal";

export function getNumFrets(baseNote: string, currNote: string | null) {
  if (currNote == null) return null;
  return Number(Interval.semitones(Note.distance(baseNote, currNote)));
}

export function getNotesFromChordName(chordName: string) {
  return Chord.get(chordName).notes;
}

export function getChordNotesPerString(
  chordName: string,
  stringTunings: string[],
  numFrets: number
) {
  let unusedNotes = getNotesFromChordName(chordName);
  const usedNotes = new Set<string>();
  return stringTunings.map((base) => {
    if (unusedNotes.includes(base)) {
      unusedNotes = unusedNotes.filter((note) => note != base);
      return base;
    }
    for (const noteCandidate of [...unusedNotes, ...usedNotes]) {
      const fretNumber = getNumFrets(base, noteCandidate);
      if (!fretNumber) continue;
      if (fretNumber < numFrets) {
        usedNotes.add(noteCandidate);
        unusedNotes = unusedNotes.filter((note) => note != noteCandidate);
        return noteCandidate;
      }
    }
    return null;
  });
  // const stringNotes: string[] = [];
  // let note_idx = 0;
  // stringTunings.forEach((base) => {
  //   stringNotes.push(notes[note_idx]);
  //   note_idx++;
  //   if (note_idx >= notes.length) {
  //     note_idx = 0;
  //   }
  // });
  // return stringNotes;
}

export function getChordNameFromNotes(notes: string[]) {
  return Chord.detect(notes, { assumePerfectFifth: true });
}
