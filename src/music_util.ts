import { Note, Chord, Interval } from "tonal";

export function getNumFrets(baseNote: string, currNote: string) {
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

export function getGuitarNotesFromChordName(
  chordName: string,
  numStrings: number
) {
  const chord = Chord.get(chordName);
  const prioritizedNotes = prioritizeChordNotes(chord);
  return prioritizedNotes.slice(0, numStrings);
}

export function getChordNotesPerString(
  chordName: string,
  baseStringTunings: string[],
  fretRange: [number, number],
  currentStringNotes: {
    [stringNum: number]: string | null;
  }
): [stringNotes: (string | null)[], fretNumToBar: number] {
  function markNoteAsUsed(noteName: string) {
    if (unusedNotes.includes(noteName) && !usedNotes.includes(noteName)) {
      usedNotes.push(noteName);
      unusedNotes = unusedNotes.filter((note) => note != noteName);
    }
  }
  var relativeFretNumToBar = 0;
  let unusedNotes = getGuitarNotesFromChordName(
    chordName,
    baseStringTunings.length
  );
  const usedNotes: string[] = [];
  while (relativeFretNumToBar + fretRange[0] < fretRange[1]) {
    const stringTunings = baseStringTunings.map((baseTuning) =>
      Note.transpose(baseTuning, Interval.fromSemitones(relativeFretNumToBar))
    );
    const stringNotes = stringTunings.map((base, i) => {
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
    const numFingers = stringNotes.filter(
      (stringNote, i) => stringNote != null && stringNote != stringTunings[i]
    ).length;
    if (numFingers <= 4) {
      return [stringNotes, relativeFretNumToBar];
    }
    relativeFretNumToBar++;
  }
  return [baseStringTunings.map(() => null), 0];
}

export function getChordNameFromNotes(
  notes: string[],
  inputtedChordName: string
) {
  const chord = Chord.get(inputtedChordName);
  const detectedChords = Chord.detect(notes);
  return (
    detectedChords.filter(
      (chordName) => chordName.indexOf(chord?.tonic || "X") == 0
    )?.[0] || detectedChords?.[0]
  );
}
