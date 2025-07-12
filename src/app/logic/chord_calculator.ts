import { NoteLiteral, Chord, Interval } from "tonal";
import {
  getNoteFromNumFrets,
  normalizeNote,
  ChordTab,
  chordTabToArray,
  fillInMutedStrings,
} from "./music_util";
import ChordNotePrioritizer, { NotePosition } from "./ChordNotePrioritizer";
import ChordTabPrioritizer from "./ChordTabPrioritizer";
import { PriorityQueue } from "@datastructures-js/priority-queue";
import { comparePriorities } from "../util";

export type NotesAndBarredFret = {
  stringNotes: (NoteLiteral | null)[];
  fretNumToBar: number;
};

const NumPermutations = 3;

export function getBestTabsForChord(
  chordName: string | null,
  baseNotes: NoteLiteral[],
  startingFretNum: number,
  numFrets: number,
  manualStringNotes: ChordTab
): NotesAndBarredFret[] {
  // For invalid/empty chords, we return an empty tab for users to be able to modify themselves
  if (
    chordName == null ||
    Chord.get(chordName).empty ||
    Chord.get(chordName).tonic == ""
  ) {
    return [
      {
        stringNotes: baseNotes.map((baseNote, i) =>
          i in manualStringNotes ? manualStringNotes[i] : baseNote
        ),
        fretNumToBar: 0,
      },
    ];
  }

  const tabNoteMatrix = generateNoteMatrix(
    baseNotes,
    startingFretNum,
    numFrets
  );
  const prioritizedChordNotes = getGuitarNotesFromChordName(chordName);
  const bassNote = getBassNoteFromChordName(chordName);

  const chordTabPrioritizer = new ChordTabPrioritizer(
    tabNoteMatrix,
    prioritizedChordNotes,
    bassNote
  );

  // If the chord has 2 notes, we want to voice them both, if it has 3 or more, we want to voice 3
  const mandatoryChordNoteAmount = Math.min(prioritizedChordNotes.length, 3);

  for (let fretToBar = 0; fretToBar < numFrets; fretToBar++) {
    for (
      let numStringsSkipped = 0, stringIdx = -1;
      numStringsSkipped < baseNotes.length - mandatoryChordNoteAmount + 1 &&
      stringIdx < baseNotes.length;
      stringIdx++
    ) {
      // This skipping can produce a chord tab with unvoiced strings in between voiced ones,
      //     but that behavior seems desirable when notes are manually specified
      if (stringIdx in manualStringNotes) {
        continue;
      }
      // Filter out strings that are being skipped so long as they don't have a manually-set note
      const trimmedMatrix = tabNoteMatrix.map((string, i) =>
        i >= stringIdx || i in manualStringNotes ? string.slice(fretToBar) : []
      );
      for (
        let enforceBassNoteIdx = 0;
        enforceBassNoteIdx <= 1;
        enforceBassNoteIdx++
      ) {
        const enforceBassNote = enforceBassNoteIdx == 0;

        const numPermutations = enforceBassNote
          ? getNumPossibleBassNotes(prioritizedChordNotes[0], trimmedMatrix)
          : //TODO: this should be more precise and should allow us to get the G#m7 voicing from the chord chart
            NumPermutations;

        for (let i = 0; i < numPermutations; i++) {
          const [stringNotes, totalFingerDistance] =
            getNewChordNotesPerStringInner(
              prioritizedChordNotes,
              bassNote,
              trimmedMatrix,
              manualStringNotes,
              enforceBassNote
            );

          chordTabPrioritizer.addChordTab(
            stringNotes,
            totalFingerDistance,
            fretToBar
          );
        }
      }
      numStringsSkipped++;
    }
  }

  const bestTabs = chordTabPrioritizer.getBestTabs();

  return bestTabs.map((chordEnv) => ({
    stringNotes: chordTabToArray(
      fillInMutedStrings(chordEnv.chordTab, baseNotes.length)
    ),
    fretNumToBar: chordEnv.barredFret,
  }));
}

export function getGuitarNotesFromChordName(chordName: string): NoteLiteral[] {
  const chord = Chord.get(chordName);
  const prioritizedNotes = prioritizeChordNotes(chord);
  return prioritizedNotes;
}

export function getBassNoteFromChordName(chordName: string): NoteLiteral {
  const chord = Chord.get(chordName);
  let bassNote: string | null = chord.bass;
  if (bassNote !== "") {
    return bassNote;
  }
  bassNote = chord.tonic;
  if (!bassNote) {
    throw new Error(`Could not get bass note for chord ${chordName}`);
  }
  return bassNote;
}

export function getChordNameFromNotes(
  notes: NoteLiteral[],
  inputtedChordName: string | null
) {
  const detectedChords = Chord.detect(notes as string[], {
    assumePerfectFifth: true,
  });
  if (!inputtedChordName) return detectedChords[0];
  const chord = Chord.get(inputtedChordName);
  return (
    detectedChords.filter(
      (chordName) =>
        chordName.indexOf(
          chord?.tonic ? (normalizeNote(chord.tonic) as string) : "X"
        ) == 0
    )?.[0] || detectedChords?.[0]
  );
}

function getNumPossibleBassNotes(
  bassNote: NoteLiteral,
  noteMatrix: NoteLiteral[][]
) {
  let n = 0;
  // we only search the first n-2 strings because we need at least 3 strings to voice a chord
  for (let stringIdx = 0; stringIdx < noteMatrix.length - 2; stringIdx++) {
    for (const note of noteMatrix[stringIdx]) {
      if (note == bassNote) n++;
    }
  }
  return n;
}

function getNewChordNotesPerStringInner(
  prioritizedChordNotes: NoteLiteral[],
  bassNote: NoteLiteral,
  noteMatrix: NoteLiteral[][],
  currentStringNotes: ChordTab,
  prioritizeVoicingBass: boolean = true,
  permutation: number = 0
): [ChordTab, totalFingerDistance: number] {
  const newStringNotes = { ...currentStringNotes };
  const numStrings = noteMatrix.length;
  const chordNotePrioritizer = new ChordNotePrioritizer(
    prioritizedChordNotes,
    bassNote,
    prioritizeVoicingBass
  );

  const chordNoteSet = new Set(prioritizedChordNotes);

  for (let stringNum = 0; stringNum < noteMatrix.length; stringNum++) {
    const stringLength = noteMatrix[stringNum].length;
    // It feels weird to do this here, but if we're skipping a string, set it to null
    if (stringLength == 0) {
      newStringNotes[stringNum] = null;
    }
    for (let fretNum = 0; fretNum < stringLength; fretNum++) {
      const note = noteMatrix[stringNum][fretNum] as string;
      if (chordNoteSet.has(noteMatrix[stringNum][fretNum])) {
        chordNotePrioritizer.addGuitarNote({ note, stringNum, fretNum });
      }
    }
  }

  let permutationIdx = 0;
  let bassNeedsToBeSet = prioritizeVoicingBass;
  const notePositions: NotePosition[] = [];

  while (Object.keys(newStringNotes).length < numStrings) {
    const guitarNote = chordNotePrioritizer.popGuitarNote();
    if (!guitarNote) {
      break;
    }
    const { note, stringNum } = guitarNote;
    if (!(stringNum in newStringNotes)) {
      if (permutationIdx < permutation) {
        // even though the prioritizer has determined this is the best voicing, we skip it for a "worse" voicing to get a different permutation
        permutationIdx++;
        continue;
      }
      newStringNotes[stringNum] = note;
      if (bassNeedsToBeSet && note == bassNote) {
        for (let stringIdx = 0; stringIdx < stringNum; stringIdx++) {
          if (!(stringIdx in newStringNotes)) {
            newStringNotes[stringIdx] = null;
          }
        }
        bassNeedsToBeSet = false;
      }
      notePositions.push(chordNotePrioritizer.useGuitarNote(guitarNote));
    }
  }

  return [newStringNotes, getTabFingerDistance(notePositions)];
}

function generateNoteMatrix(
  baseNotes: NoteLiteral[],
  startingFretNum: number,
  numFrets: number
): NoteLiteral[][] {
  const noteMatrix: NoteLiteral[][] = [];
  for (const baseNote of baseNotes) {
    const stringNotes: NoteLiteral[] = [];
    for (let fretIdx = 0; fretIdx <= numFrets; fretIdx++) {
      // When the startingFretNum isn't 0, we still want open notes to be an option
      const fretOffset = fretIdx == 0 ? 0 : fretIdx + startingFretNum;
      stringNotes.push(getNoteFromNumFrets(baseNote, fretOffset));
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

  chord.intervals.forEach((intervalName, idx) => {
    const intervalSemitones = Interval.semitones(intervalName);
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
    if (intervalSemitones in semitonesToIndices) {
      notes.push(
        normalizeNote(chord.notes[semitonesToIndices[intervalSemitones]])
      );
    }
  });
  return notes;
}

// It sucks that we cant do this in one of the Prioritizers, because the prioritizers only know the note names, not their positions
function getTabFingerDistance(notePositions: NotePosition[]) {
  let totalFingerDistance = 0;
  const usedPairs = new Set<string>();

  const nonOpenNotePositions = notePositions.filter((x) => x.fretNum != 0);
  const closestPositions = new PriorityQueue<[NotePosition, NotePosition]>(
    (a, b) =>
      comparePriorities(
        getNotesFingerDistance(a[0], a[1]),
        getNotesFingerDistance(b[0], b[1])
      ) ?? 0
  );
  for (let i = 0; i < nonOpenNotePositions.length; i++) {
    for (let j = i + 1; j < nonOpenNotePositions.length; j++) {
      closestPositions.push([nonOpenNotePositions[i], nonOpenNotePositions[j]]);
    }
  }

  //
  while (closestPositions.size() > 0) {
    const closestPair = closestPositions.pop() as [NotePosition, NotePosition];
    const [aString, bString] = [
      JSON.stringify(closestPair[0]),
      JSON.stringify(closestPair[1]),
    ];
    if (usedPairs.has(aString) || usedPairs.has(bString)) continue;
    totalFingerDistance += getNotesFingerDistance(...closestPair);
    usedPairs.add(aString);
    usedPairs.add(bString);
  }

  return totalFingerDistance;
}

function getNotesFingerDistance(a: NotePosition, b: NotePosition) {
  return Math.abs(a.stringNum - b.stringNum) + Math.abs(a.fretNum - b.fretNum);
}
