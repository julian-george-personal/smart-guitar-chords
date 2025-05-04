import { Note, Interval, NoteLiteral } from "tonal";

export type ChordTab = {
  [stringNum: number]: NoteLiteral | null;
};

export function normalizeNote(noteName: NoteLiteral): NoteLiteral {
  const chroma = Note.chroma(noteName);
  return ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][
    chroma
  ];
}

export function getNumFrets(baseNote: NoteLiteral, currNote: NoteLiteral) {
  return (
    Number(
      Interval.semitones(Interval.simplify(Note.distance(baseNote, currNote)))
    ) % 12
  );
}

export function getNoteFromNumFrets(baseNote: NoteLiteral, numFrets: number) {
  return Note.tr(baseNote, Interval.fromSemitones(numFrets));
}

export function chordTabToArray(chordTab: ChordTab) {
  const notes: (NoteLiteral | null)[] = [];
  for (const stringNum of Object.keys(chordTab)
    .map((key) => parseInt(key))
    .toSorted()) {
    notes.push(chordTab[stringNum]);
  }
  return notes;
}

export function fillInMutedStrings(stringNotes: ChordTab, numStrings: number) {
  for (let i = 0; i < numStrings; i++) {
    if (!(i in stringNotes)) {
      stringNotes[i] = null;
    }
  }
  return stringNotes;
}

export function sanitizeChordName(chordString: string) {
  return chordString.trim().replace(/[^a-zA-G0-9#//]/g, "");
}

export function sanitizeNoteName(noteString: string) {
  return noteString.trim().replace(/[^A-G#b]/g, "");
}
