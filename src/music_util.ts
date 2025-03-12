import { Note, Chord, Interval } from "tonal";

export function getNumFrets(baseNote: string, currNote: string) {
  return Number(
    Interval.semitones(Interval.simplify(Note.distance(baseNote, currNote)))
  );
}

export function getNoteFromNumFrets(baseNote: string, numFrets: number) {
  return Note.tr(baseNote, Interval.fromSemitones(numFrets));
}

function generateNoteMatrix(baseNotes: string[], numFrets: number) {
  const noteMatrix: string[][] = [];
  for (const baseNote of baseNotes) {
    const stringNotes: string[] = [];
    for (let fretIdx = 0; fretIdx <= numFrets; fretIdx++) {
      stringNotes.push(getNoteFromNumFrets(baseNote, fretIdx));
    }
    noteMatrix.push(stringNotes);
  }
  return noteMatrix;
}

export function getChordNotesPerString(
  chordName: string,
  baseNotes: string[],
  numFrets: number,
  currentStringNotes: {
    [stringNum: number]: string | null;
  }
): [stringNotes: (string | null)[], fretNumToBar: number] {
  const tabNoteMatrix = generateNoteMatrix(baseNotes, numFrets);
  const chordNotes = getGuitarNotesFromChordName(chordName, baseNotes.length);
  const bassNote = chordNotes[0];

  // Try to find the bass note for the chord
  for (let i = 0; i <= baseNotes.length - 3; i++) {
    const fretNum = tabNoteMatrix[i].indexOf(bassNote);
    // If the chord exists on this string, and the currently set note on that string is either that note or null
    if (
      fretNum != -1 &&
      (!(i in currentStringNotes) || currentStringNotes[i] == bassNote)
    ) {
      currentStringNotes[i] = bassNote;
      for (let j = 0; j < i; j++) {
        if (!(j in currentStringNotes)) {
          currentStringNotes[j] = null;
        }
      }
      break;
    }
  }
  return [
    getChordNotesPerStringInner(
      chordNotes,
      baseNotes,
      numFrets,
      currentStringNotes,
      tabNoteMatrix
    ),
    0,
  ];
}

function getChordNotesPerStringInner(
  chordNotes: string[],
  baseNotes: string[],
  numFrets: number,
  currentStringNotes: {
    [stringNum: number]: string | null;
  },
  noteMatrix: string[][]
) {
  for (let fretIdx = 0; fretIdx <= numFrets; fretIdx++) {
    for (let stringIdx = 0; stringIdx < baseNotes.length; stringIdx++) {
      if (stringIdx in currentStringNotes) {
        continue;
      }
      for (const chordNote of chordNotes) {
        if (noteMatrix[stringIdx][fretIdx] == chordNote) {
          currentStringNotes[stringIdx] = chordNote;
          chordNotes.push(chordNotes.pop() as string);
          break;
        }
      }
    }
  }
  return Object.entries(currentStringNotes)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map((a) => a[1]);
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

// export function getChordNotesPerString(
//   chordName: string,
//   baseStringTunings: string[],
//   fretRange: [number, number],
//   currentStringNotes: {
//     [stringNum: number]: string | null;
//   }
// ): [stringNotes: (string | null)[], fretNumToBar: number] {
//   function markNoteAsUsed(noteName: string) {
//     if (unusedNotes.includes(noteName) && !usedNotes.includes(noteName)) {
//       usedNotes.push(noteName);
//       unusedNotes = unusedNotes.filter((note) => note != noteName);
//     }
//   }
//   let relativeFretNumToBar = 0;
//   let unusedNotes = getGuitarNotesFromChordName(
//     chordName,
//     baseStringTunings.length
//   );
//   const usedNotes: string[] = [];
//   while (relativeFretNumToBar + fretRange[0] <= fretRange[1]) {
//     const stringTunings = baseStringTunings.map((baseTuning) =>
//       Note.transpose(baseTuning, Interval.fromSemitones(relativeFretNumToBar))
//     );
//     const stringNotes = stringTunings.map((base, i) => {
//       if (i in currentStringNotes) {
//         if (currentStringNotes[i] != null) {
//           markNoteAsUsed(currentStringNotes[i]);
//         }
//         return currentStringNotes[i];
//       }
//       for (const noteCandidate of [...unusedNotes, ...usedNotes]) {
//         const fretNumber = getNumFrets(base, noteCandidate);
//         if (fretNumber == null) continue;
//         if (fretNumber >= fretRange[0] && fretNumber <= fretRange[1]) {
//           markNoteAsUsed(noteCandidate);
//           return noteCandidate;
//         }
//       }
//       return null;
//     });
//     const numFingers = stringNotes.filter(
//       (stringNote, i) => stringNote != null && stringNote != stringTunings[i]
//     ).length;

//     if (numFingers <= 4) {
//       console.log(numFingers, relativeFretNumToBar);
//       return [stringNotes, relativeFretNumToBar];
//     }
//     relativeFretNumToBar++;
//   }
//   return [
//     baseStringTunings.map((note, i) => (i in currentStringNotes ? note : null)),
//     0,
//   ];
// }

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
