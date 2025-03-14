import { Note, Chord, Interval, transpose } from "tonal";

export type StringObj = {
  [stringNum: number]: string | null;
};

export function getNumFrets(baseNote: string, currNote: string) {
  return (
    Number(
      Interval.semitones(Interval.simplify(Note.distance(baseNote, currNote)))
    ) % 12
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

function stringDictToArray(stringNotes: StringObj) {
  return Object.entries(stringNotes)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map((a) => a[1]);
}

function arrayToStringDict(notes: (string | null)[]) {
  const stringDict: StringObj = {};
  for (let i = 0; i < notes.length; i++) {
    stringDict[i] = notes[i];
  }
  return stringDict;
}

function getMinStringNumber(stringNotes: StringObj) {
  const strings = Object.keys(stringNotes).map((a) => parseInt(a));
  if (strings.length == 0) return undefined;
  return Math.min(...strings);
}

const InnerStringsCanBeMuted = false;

function chordNotesAreValid(
  stringNotes: StringObj,
  chordNotes: string[],
  baseNotes: string[]
) {
  const stringNoteValues = stringDictToArray(stringNotes);

  // False if it takes more than 4 fingers
  if (
    stringNoteValues.filter(
      (a, i) => a != null && getNumFrets(baseNotes[i], a) > 0
    ).length > 4
  )
    return false;

  // False if it doesn't voice the 3 most prioritized chord notes
  for (const chordNote of chordNotes.slice(0, 3)) {
    if (!stringNoteValues.includes(chordNote)) return false;
  }

  // False if inner strings of the tab can be muted
  if (!InnerStringsCanBeMuted) {
    const stringsMuted = stringDictToArray(
      fillInMutedStrings(stringNotes, baseNotes.length)
    ).map((a) => (a === null ? true : false));
    // if there are more than one continuous region of true or false, return false
    let isRegionComplete = false;
    for (const isStringMuted of stringsMuted.slice(1)) {
      if (isStringMuted != stringsMuted[0]) {
        isRegionComplete = true;
      } else if (isRegionComplete) {
        return false;
      }
    }
  }

  return true;
}

function fillInMutedStrings(stringNotes: StringObj, numStrings: number) {
  for (let i = 0; i < numStrings; i++) {
    if (!(i in stringNotes)) {
      stringNotes[i] = null;
    }
  }
  return stringNotes;
}

export function getChordNotesPerString(
  chordName: string,
  baseNotes: string[],
  numFrets: number,
  manualStringNotes: StringObj,
  bassMandatory: boolean = true
): [stringNotes: (string | null)[], fretNumToBar: number] {
  const tabNoteMatrix = generateNoteMatrix(baseNotes, numFrets);
  const chordNotes = getGuitarNotesFromChordName(chordName, baseNotes.length);
  const bassNote = chordNotes[0];
  let currentStringNotes = { ...manualStringNotes };

  if (bassMandatory) {
    currentStringNotes = {
      ...currentStringNotes,
      ...getBassStringNotes(bassNote, tabNoteMatrix, currentStringNotes),
    };
  }

  if (Object.values(currentStringNotes).includes(bassNote)) {
    chordNotes.push(chordNotes.shift() as string);
  }

  let stringNotesIteration: StringObj = {};
  let permutation = 0;
  do {
    stringNotesIteration = getNewChordNotesPerStringInner(
      chordNotes,
      tabNoteMatrix,
      currentStringNotes,
      permutation
    );
    permutation++;
    break;
  } while (
    Object.values(stringNotesIteration).length >= 3 &&
    !chordNotesAreValid(
      { ...stringNotesIteration, ...currentStringNotes },
      chordNotes,
      baseNotes
    )
  );

  if (
    !chordNotesAreValid(
      { ...stringNotesIteration, ...currentStringNotes },
      chordNotes,
      baseNotes
    )
  ) {
    if (bassMandatory) {
      return getChordNotesPerString(
        chordName,
        baseNotes,
        numFrets,
        manualStringNotes,
        false
      );
    }
  }

  currentStringNotes = fillInMutedStrings(
    {
      ...currentStringNotes,
      ...stringNotesIteration,
    },
    tabNoteMatrix.length
  );

  return [stringDictToArray(currentStringNotes), 0];
}

function getBassStringNotes(
  bassNote: string,
  noteMatrix: string[][],
  currentStringNotes: StringObj
) {
  const bassStringNotes: StringObj = {};
  const bassStringNoteMatrix = noteMatrix.slice(0, -3);

  let bassNoteString = getMinStringNumber(
    getNewChordNotesPerStringInner(
      [bassNote],
      bassStringNoteMatrix.map((a) => a.slice(0, 1)),
      currentStringNotes
    )
  );

  if (bassNoteString === undefined) {
    bassNoteString = getMinStringNumber(
      getNewChordNotesPerStringInner(
        [bassNote],
        bassStringNoteMatrix,
        currentStringNotes
      )
    );
  }

  if (bassNoteString !== undefined) {
    for (let i = 0; i < bassNoteString; i++) {
      bassStringNotes[i] = null;
    }
    bassStringNotes[bassNoteString] = bassNote;
  }

  return bassStringNotes;
}

function getNewChordNotesPerStringInner(
  chordNotes: string[],
  noteMatrix: string[][],
  currentStringNotes: StringObj,
  permutation: number = 0
) {
  const innerCurrentStringNotes: StringObj = {};
  // TODO: change algorithm so E9 has the F# on the high E
  for (let fretIdx = 0; fretIdx <= noteMatrix[0].length; fretIdx++) {
    for (let stringIdx = 0; stringIdx < noteMatrix.length; stringIdx++) {
      if (stringIdx in { ...innerCurrentStringNotes, ...currentStringNotes }) {
        continue;
      }
      for (const chordNote of chordNotes) {
        if (getNumFrets(noteMatrix[stringIdx][fretIdx], chordNote) == 0) {
          if (permutation == 0) {
            innerCurrentStringNotes[stringIdx] = chordNote;
            chordNotes.push(chordNotes.shift() as string);
          } else {
            permutation--;
          }
          break;
        }
      }
    }
    if (Object.keys(innerCurrentStringNotes).length == noteMatrix.length) {
      break;
    }
  }
  return innerCurrentStringNotes;
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
