import { Note, Chord, Interval } from "tonal";

export function getNumFrets(baseNote: string, currNote: string | null) {
  if (currNote == null) return null;
  return Number(
    Interval.semitones(Interval.simplify(Note.distance(baseNote, currNote)))
  );
}

export function getNoteFromNumFrets(baseNote: string, numFrets: number) {
  return Note.tr(baseNote, Interval.fromSemitones(numFrets));
}

const prioritizedIntervals: number[] = ["1P", "3m", "3M"].map(
  Interval.semitones
);
const deprioritizedIntervals: number[] = ["5P"].map(Interval.semitones);

function prioritizeChordNotes(chord: Chord.Chord) {
  const semitonesToIndices: { [semitones: number]: number } = {};
  const unprioritizedIntervals: number[] = [];
  chord.intervals.forEach((interval, idx) => {
    const intervalSemitones = Interval.semitones(interval);
    semitonesToIndices[intervalSemitones] = idx;
    if (
      ![...prioritizedIntervals, ...deprioritizedIntervals].includes(
        intervalSemitones
      )
    ) {
      unprioritizedIntervals.push(intervalSemitones);
    }
  });
  unprioritizedIntervals.sort((a, b) => b - a);
  const notes: string[] = [];
  [
    ...prioritizedIntervals,
    ...unprioritizedIntervals,
    ...deprioritizedIntervals,
  ].forEach((intervalSemitones) => {
    if (intervalSemitones in semitonesToIndices)
      notes.push(chord.notes[semitonesToIndices[intervalSemitones]]);
  });
  return notes;
}

export function getNotesFromChordName(chordName: string, numStrings: number) {
  const chord = Chord.get(chordName);
  const prioritizedNotes = prioritizeChordNotes(chord);
  return prioritizedNotes.slice(0, numStrings);
}

export function getChordNotesPerString(
  chordName: string,
  stringTunings: string[],
  fretRange: [number, number],
  currentStringNotes: {
    [stringNum: number]: string | null;
  }
) {
  function markNoteAsUsed(noteName: string) {
    if (unusedNotes.includes(noteName) && !usedNotes.includes(noteName)) {
      usedNotes.push(noteName);
      unusedNotes = unusedNotes.filter((note) => note != noteName);
    }
  }
  let unusedNotes = getNotesFromChordName(chordName, stringTunings.length);
  const usedNotes: string[] = [];
  return stringTunings.map((base, i) => {
    if (i in currentStringNotes) {
      if (currentStringNotes[i] != null) {
        markNoteAsUsed(currentStringNotes[i]);
      }
      return currentStringNotes[i];
    }
    for (const noteCandidate of [...unusedNotes, ...usedNotes]) {
      const fretNumber = getNumFrets(base, noteCandidate);
      if (fretNumber == null) continue;
      if (fretNumber >= fretRange[0] && fretNumber < fretRange[1]) {
        markNoteAsUsed(noteCandidate);
        return noteCandidate;
      }
    }
    return null;
  });
}

export function getChordNameFromNotes(notes: string[]) {
  return Chord.detect(notes);
}
