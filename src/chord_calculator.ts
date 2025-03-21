import { NoteLiteral, Chord, Interval } from "tonal";
import { ICompare, PriorityQueue } from "@datastructures-js/priority-queue";
import {
  StringObj,
  getNoteFromNumFrets,
  normalizeNote,
  getNumFrets,
} from "./music_util";

export function getChordNotesPerString(
  chordName: string,
  baseNotes: NoteLiteral[],
  numFrets: number,
  manualStringNotes: StringObj
): [stringNotes: (NoteLiteral | null)[], fretNumToBar: number] {
  const tabNoteMatrix = generateNoteMatrix(baseNotes, numFrets);
  const chordNotes = getGuitarNotesFromChordName(chordName, baseNotes.length);

  const currentStringNotes = getNewChordNotesPerStringInner(
    chordNotes,
    tabNoteMatrix,
    manualStringNotes
  );

  return [stringDictToArray(currentStringNotes), 0];
}

export function getGuitarNotesFromChordName(
  chordName: string,
  numStrings: number
): NoteLiteral[] {
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

type NotePosition = [stringNum: number, fretNum: number];

const compareNotePositions: ICompare<NotePosition> = (
  a: NotePosition,
  b: NotePosition
) => {
  if (a[1] > b[1]) return 1;
  if (a[1] < b[1]) return -1;
  if (a[0] > b[0]) return 1;
  if (a[0] < b[0]) return -1;
  return 0;
};

const compareBassNotePositions: ICompare<NotePosition> = (
  a: NotePosition,
  b: NotePosition
) => {
  if (a[0] > b[0]) return 1;
  if (a[0] < b[0]) return -1;
  if (a[1] > b[1]) return 1;
  if (a[1] < b[1]) return -1;
  return 0;
};

// this should actually iterate thru the entire note matrix and generate note candidates on each string (as a kind of priority queue)
// then iterate thru the strings and choose which candidate to use
function getNewChordNotesPerStringInner(
  prioritizedChordNotes: NoteLiteral[],
  noteMatrix: NoteLiteral[][],
  currentStringNotes: StringObj,
  prioritizeVoicingBass: boolean = true
) {
  const newStringNotes = { ...currentStringNotes };
  const numStrings = noteMatrix.length;
  const prioritizedChordNotePositions: PriorityQueue<NotePosition>[] = [];
  for (const chordNote of prioritizedChordNotes) {
    prioritizedChordNotePositions.push(
      chordNote == prioritizedChordNotes[0] && prioritizeVoicingBass
        ? new PriorityQueue<NotePosition>(compareBassNotePositions)
        : new PriorityQueue<NotePosition>(compareNotePositions)
    );
  }
  for (let stringNum = 0; stringNum < numStrings; stringNum++) {
    if (stringNum in newStringNotes) {
      continue;
    }
    for (let fretNum = 0; fretNum < noteMatrix[stringNum].length; fretNum++) {
      const currNote = noteMatrix[stringNum][fretNum];
      const chordNotePriority = prioritizedChordNotes.indexOf(currNote);
      if (chordNotePriority != -1) {
        prioritizedChordNotePositions[chordNotePriority].enqueue([
          stringNum,
          fretNum,
        ]);
      }
    }
  }

  let bassNeeded = prioritizeVoicingBass;
  while (
    Object.keys(newStringNotes).length < numStrings &&
    prioritizedChordNotePositions.filter((x) => x.size() > 0).length > 0
  ) {
    for (
      let chordNoteIdx = 0;
      chordNoteIdx < prioritizedChordNotePositions.length;
      chordNoteIdx++
    ) {
      const currentNotePriorities = prioritizedChordNotePositions[chordNoteIdx];
      let notePosition: NotePosition | null = null;
      while (notePosition == null) {
        notePosition = currentNotePriorities.pop();
        if (notePosition == null) break;
        if (notePosition[0] in newStringNotes) {
          notePosition = null;
        }
      }
      if (notePosition == null) {
        continue;
      }
      newStringNotes[notePosition[0]] = prioritizedChordNotes[chordNoteIdx];

      if (chordNoteIdx == 0 && bassNeeded) {
        for (let i = 0; i < notePosition[0]; i++) {
          newStringNotes[i] ??= null;
        }
        bassNeeded = false;
      }
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

function stringDictToArray(stringNotes: StringObj) {
  return Object.entries(stringNotes)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map((a) => a[1]);
}

const InnerStringsCanBeMuted = false;

function chordNotesAreValid(
  stringNotes: StringObj,
  chordNotes: NoteLiteral[],
  baseNotes: NoteLiteral[]
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
