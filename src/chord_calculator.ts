import { NoteLiteral, Chord, Interval } from "tonal";
import {
  StringObj,
  getNoteFromNumFrets,
  normalizeNote,
  getNumFrets,
} from "./music_util";
import ChordNotePrioritizer from "./ChordNotePrioritizer";

export function getChordNotesPerString(
  chordName: string,
  baseNotes: NoteLiteral[],
  numFrets: number,
  manualStringNotes: StringObj
): [stringNotes: (NoteLiteral | null)[], fretNumToBar: number] {
  const tabNoteMatrix = generateNoteMatrix(baseNotes, numFrets);
  const chordNotes = getGuitarNotesFromChordName(chordName);

  let stringNotesWithBarredFret: [(NoteLiteral | null)[], number] = [[], 0];
  let minNumFingers = Infinity;

  for (let fretToBar = 0; fretToBar < numFrets; fretToBar++) {
    const barredMatrix = tabNoteMatrix.map((string) => string.slice(fretToBar));
    const barredStringNotes = getNewChordNotesPerStringInner(
      chordNotes,
      barredMatrix,
      manualStringNotes
    );
    const barredBaseNotes = barredMatrix.map((string) => string[0]);

    const numFingers =
      Object.values(barredStringNotes).filter(
        (note, i) => note != null && note != barredBaseNotes[i]
      ).length + (fretToBar > 0 ? 1 : 0);
    if (
      numFingers < minNumFingers &&
      chordNotesAreValid(barredStringNotes, chordNotes, barredBaseNotes)
    ) {
      stringNotesWithBarredFret = [
        stringObjToArray(barredStringNotes),
        fretToBar,
      ];
      minNumFingers = numFingers;
    }
  }

  console.log(stringNotesWithBarredFret);

  return stringNotesWithBarredFret;
}

export function getGuitarNotesFromChordName(chordName: string): NoteLiteral[] {
  const chord = Chord.get(chordName);
  const prioritizedNotes = prioritizeChordNotes(chord);
  return prioritizedNotes;
}

export function getChordNameFromNotes(
  notes: NoteLiteral[],
  inputtedChordName: string
) {
  const chord = Chord.get(inputtedChordName);
  const detectedChords = Chord.detect(notes as string[]);
  return (
    detectedChords.filter(
      (chordName) => chordName.indexOf(chord?.tonic || "X") == 0
    )?.[0] || detectedChords?.[0]
  );
}

function getNewChordNotesPerStringInner(
  prioritizedChordNotes: NoteLiteral[],
  noteMatrix: NoteLiteral[][],
  currentStringNotes: StringObj,
  prioritizeVoicingBass: boolean = true
) {
  const newStringNotes = { ...currentStringNotes };
  const numStrings = noteMatrix.length;
  const chordNotePrioritizer = new ChordNotePrioritizer(prioritizedChordNotes);
  const chordNoteSet = new Set(prioritizedChordNotes);

  for (let stringNum = 0; stringNum < noteMatrix.length; stringNum++) {
    for (let fretNum = 0; fretNum < noteMatrix[0].length; fretNum++) {
      const note = noteMatrix[stringNum][fretNum] as string;
      if (chordNoteSet.has(noteMatrix[stringNum][fretNum])) {
        chordNotePrioritizer.addGuitarNote({ note, stringNum, fretNum });
      }
    }
  }

  let bassNeedsToBeSet = prioritizeVoicingBass;

  while (Object.keys(newStringNotes).length < numStrings) {
    const guitarNote = chordNotePrioritizer.popGuitarNote();
    if (!guitarNote) {
      break;
    }
    const { note, stringNum } = guitarNote;
    if (!(stringNum in newStringNotes)) {
      newStringNotes[stringNum] = note;
      if (bassNeedsToBeSet && note == prioritizedChordNotes[0]) {
        for (let stringIdx = 0; stringIdx < stringNum; stringIdx++) {
          if (!(stringIdx in newStringNotes)) {
            newStringNotes[stringIdx] = null;
          }
        }
        bassNeedsToBeSet = false;
      }
      chordNotePrioritizer.useGuitarNote(guitarNote);
    }
  }

  return newStringNotes;
}

function generateNoteMatrix(
  baseNotes: NoteLiteral[],
  numFrets: number
): NoteLiteral[][] {
  const noteMatrix: NoteLiteral[][] = [];
  for (const baseNote of baseNotes) {
    const stringNotes: NoteLiteral[] = [];
    for (let fretIdx = 0; fretIdx <= numFrets; fretIdx++) {
      stringNotes.push(getNoteFromNumFrets(baseNote, fretIdx));
    }
    noteMatrix.push(stringNotes);
  }
  return noteMatrix.map((string) => string.map(normalizeNote));
}

function stringObjToArray(stringObj: StringObj) {
  const notes: (NoteLiteral | null)[] = [];
  for (const stringNum of Object.keys(stringObj)
    .map((key) => parseInt(key))
    .toSorted()) {
    notes.push(stringObj[stringNum]);
  }
  return notes;
}

const prioritizedIntervals: number[] = ["1P", "3m", "3M"].map(
  Interval.semitones
);
const deprioritizedIntervals: number[] = ["5P"].map(Interval.semitones);

function prioritizeChordNotes(chord: Chord.Chord): NoteLiteral[] {
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
  const notes: NoteLiteral[] = [];
  [
    ...prioritizedIntervals,
    ...unprioritizedIntervals,
    ...deprioritizedIntervals,
  ].forEach((intervalSemitones) => {
    if (intervalSemitones in semitonesToIndices)
      notes.push(
        normalizeNote(chord.notes[semitonesToIndices[intervalSemitones]])
      );
  });
  return notes;
}

const InnerStringsCanBeMuted = false;
const EnforceBassNote = true;

function chordNotesAreValid(
  stringNotes: StringObj,
  chordNotes: NoteLiteral[],
  baseNotes: NoteLiteral[]
) {
  const stringNoteValues = stringObjToArray(stringNotes);

  if (
    stringNoteValues.filter((note) => note != null)[0] != chordNotes[0] &&
    EnforceBassNote
  ) {
    return false;
  }

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
    const stringsMuted = stringObjToArray(
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
