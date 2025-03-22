import { NoteLiteral, Chord, Interval } from "tonal";
import {
  getNoteFromNumFrets,
  normalizeNote,
  ChordTab,
  chordTabToArray,
  fillInMutedStrings,
} from "./music_util";
import ChordNotePrioritizer from "./ChordNotePrioritizer";
import ChordTabPrioritizer from "./ChordTabPrioritizer";

export function getChordNotesPerString(
  chordName: string | null,
  baseNotes: NoteLiteral[],
  numFrets: number,
  manualStringNotes: ChordTab
): [stringNotes: (NoteLiteral | null)[], fretNumToBar: number] {
  if (chordName == null || Chord.get(chordName).empty) {
    return [
      baseNotes.map((baseNote, i) =>
        i in manualStringNotes ? manualStringNotes[i] : baseNote
      ),
      0,
    ];
  }
  const tabNoteMatrix = generateNoteMatrix(baseNotes, numFrets);
  const chordNotes = getGuitarNotesFromChordName(chordName);

  const chordTabPrioritizer = new ChordTabPrioritizer(
    tabNoteMatrix,
    chordNotes
  );

  for (
    let enforceBassNoteIdx = 0;
    enforceBassNoteIdx <= 1;
    enforceBassNoteIdx++
  ) {
    const enforceBassNote = enforceBassNoteIdx == 0;
    for (let fretToBar = 0; fretToBar < numFrets; fretToBar++) {
      const barredMatrix = tabNoteMatrix.map((string) =>
        string.slice(fretToBar)
      );
      const numPermutations = enforceBassNote
        ? getNumPossibleBassNotes(chordNotes[0], barredMatrix)
        : //TODO: this should be more precise and should allow us to get the G#m7 voicing from the chord chart
          3;

      for (let i = 0; i < numPermutations; i++) {
        const barredStringNotes = getNewChordNotesPerStringInner(
          chordNotes,
          barredMatrix,
          manualStringNotes,
          enforceBassNote
        );
        chordTabPrioritizer.addChordTab(barredStringNotes, fretToBar);
      }
    }
  }

  const bestChordTabEnvelope = chordTabPrioritizer.popChordTab();
  if (!bestChordTabEnvelope) {
    return [[], 0];
  }

  return [
    chordTabToArray(
      fillInMutedStrings(bestChordTabEnvelope.chordTab, baseNotes.length)
    ),
    bestChordTabEnvelope.barredFret,
  ];
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
  noteMatrix: NoteLiteral[][],
  currentStringNotes: ChordTab,
  prioritizeVoicingBass: boolean = true,
  permutation: number = 0
) {
  const newStringNotes = { ...currentStringNotes };
  const numStrings = noteMatrix.length;
  const chordNotePrioritizer = new ChordNotePrioritizer(
    prioritizedChordNotes,
    prioritizeVoicingBass
  );
  const chordNoteSet = new Set(prioritizedChordNotes);

  for (let stringNum = 0; stringNum < noteMatrix.length; stringNum++) {
    for (let fretNum = 0; fretNum < noteMatrix[0].length; fretNum++) {
      const note = noteMatrix[stringNum][fretNum] as string;
      if (chordNoteSet.has(noteMatrix[stringNum][fretNum])) {
        chordNotePrioritizer.addGuitarNote({ note, stringNum, fretNum });
      }
    }
  }

  let permutationIdx = 0;
  let bassNeedsToBeSet = prioritizeVoicingBass;

  while (Object.keys(newStringNotes).length < numStrings) {
    const guitarNote = chordNotePrioritizer.popGuitarNote();
    if (!guitarNote) {
      break;
    }
    const { note, stringNum } = guitarNote;
    if (!(stringNum in newStringNotes)) {
      if (permutationIdx < permutation) {
        permutationIdx++;
        continue;
      }
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
