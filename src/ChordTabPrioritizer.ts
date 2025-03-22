import { ICompare, PriorityQueue } from "@datastructures-js/priority-queue";
import {
  ChordTab,
  chordTabToArray,
  getNumFrets,
  fillInMutedStrings,
} from "./music_util";
import { NoteLiteral } from "tonal";
import { comparePriorities } from "./util";

type ChordTabEnvelope = {
  chordTab: ChordTab;
  barredFret: number;
  // doesnt include bar finger
  numFingers: number;
  totalFingerDistance: number;
};

function getNumFingerPriority(chordTabEnvelope: ChordTabEnvelope) {
  return (
    chordTabEnvelope.numFingers + (chordTabEnvelope.barredFret > 0 ? 1 : 0)
  );
}

export default class ChordTabPrioritizer {
  private noteMatrix: NoteLiteral[][];
  private prioritizedChordNotes: NoteLiteral[];
  private avoidBar: boolean = true;

  private compareTabs: ICompare<ChordTabEnvelope> = (
    a: ChordTabEnvelope,
    b: ChordTabEnvelope
  ) => {
    let comparison = comparePriorities(
      this.isChordTabEnvelopeValid(a) ? 0 : 1,
      this.isChordTabEnvelopeValid(b) ? 0 : 1
    );
    if (comparison != null) return comparison;

    if (this.avoidBar) {
      comparison = comparePriorities(
        a.barredFret > 0 ? 1 : 0,
        b.barredFret > 0 ? 1 : 0
      );
      if (comparison != null) return comparison;
    }

    comparison = comparePriorities(
      getNumFingerPriority(a),
      getNumFingerPriority(b)
    );
    if (comparison != null) return comparison;
    return 0;
  };

  private chordTabQueue: PriorityQueue<ChordTabEnvelope> =
    new PriorityQueue<ChordTabEnvelope>(this.compareTabs);

  private buildChordTabEnvelope(
    chordTab: ChordTab,
    barredFret: number
  ): ChordTabEnvelope {
    return {
      chordTab,
      barredFret,
      numFingers: Object.entries(chordTab).filter(
        ([stringNum, note]) =>
          note != null &&
          note != this.noteMatrix[parseInt(stringNum)][barredFret]
      ).length,
      totalFingerDistance: this.calculateTotalFingerDistance(chordTab),
    };
  }

  private calculateTotalFingerDistance(chordTab: ChordTab) {
    return 0;
  }

  private isChordTabEnvelopeValid(chordTabEnvelope: ChordTabEnvelope) {
    return chordNotesAreValid(
      chordTabEnvelope.chordTab,
      this.prioritizedChordNotes,
      this.noteMatrix.map((s) => s[chordTabEnvelope.barredFret]),
      chordTabEnvelope.barredFret != 0
    );
  }

  public constructor(
    noteMatrix: NoteLiteral[][],
    prioritizedChordNotes: NoteLiteral[]
  ) {
    this.noteMatrix = noteMatrix;
    this.prioritizedChordNotes = prioritizedChordNotes;
  }

  public addChordTab(chordTab: ChordTab, barredFret: number) {
    this.chordTabQueue.enqueue(
      this.buildChordTabEnvelope(chordTab, barredFret)
    );
    console.log(this.chordTabQueue.toArray());
  }

  public popChordTab() {
    return this.chordTabQueue.pop();
  }
}

const InnerStringsCanBeMuted = false;
const EnforceBassNote = false;

function chordNotesAreValid(
  stringNotes: ChordTab,
  chordNotes: NoteLiteral[],
  baseNotes: NoteLiteral[],
  isTabbed: boolean
) {
  const stringNoteValues = chordTabToArray(stringNotes);

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
    ).length +
      (isTabbed ? 1 : 0) >
    4
  )
    return false;

  // False if it doesn't voice the 3 most prioritized chord notes
  for (const chordNote of chordNotes.slice(0, 3)) {
    if (!stringNoteValues.includes(chordNote)) return false;
  }

  // False if inner strings of the tab can be muted
  if (!InnerStringsCanBeMuted) {
    const stringsMuted = chordTabToArray(
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
