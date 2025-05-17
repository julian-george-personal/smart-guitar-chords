import { ICompare, PriorityQueue } from "@datastructures-js/priority-queue";
import {
  ChordTab,
  chordTabToArray,
  getNumFrets,
  fillInMutedStrings,
} from "./music_util";
import { NoteLiteral } from "tonal";
import { comparePriorities } from "../util";

type ChordTabEnvelope = {
  chordTab: ChordTab;
  barredFret: number;
  // doesnt include bar finger
  numFingers: number;
  totalFingerDistance: number;
  bassOnBottom: boolean;
};

function getPriority(chordTabEnvelope: ChordTabEnvelope) {
  return (
    chordTabEnvelope.numFingers +
    (chordTabEnvelope.barredFret > 0 ? 1 : 0) +
    (chordTabEnvelope.bassOnBottom ? 0 : 1)
  );
}

export default class ChordTabPrioritizer {
  private noteMatrix: NoteLiteral[][];
  private prioritizedChordNotes: NoteLiteral[];
  private existingStringifiedTabs: Set<string> = new Set();
  private avoidBar: boolean = true;
  private bassNote: NoteLiteral;

  private compareTabs: ICompare<ChordTabEnvelope> = (
    a: ChordTabEnvelope,
    b: ChordTabEnvelope
  ) => {
    let comparison = comparePriorities(
      this.isChordTabEnvelopeValid(a) ? 0 : 1,
      this.isChordTabEnvelopeValid(b) ? 0 : 1
    );
    if (comparison != null) {
      // console.log("A", comparison, a.chordTab, b.chordTab);
      return comparison;
    }

    if (this.avoidBar) {
      comparison = comparePriorities(
        a.barredFret > 0 ? 1 : 0,
        b.barredFret > 0 ? 1 : 0
      );
      if (comparison != null) {
        // console.log("B", comparison, a.chordTab, b.chordTab);
        return comparison;
      }
    }

    comparison = comparePriorities(getPriority(a), getPriority(b));

    if (comparison != null) {
      // console.log("C", comparison, a.chordTab, b.chordTab);
      return comparison;
    }
    return 0;
  };

  private chordTabQueue: PriorityQueue<ChordTabEnvelope> =
    new PriorityQueue<ChordTabEnvelope>(this.compareTabs);

  private buildChordTabEnvelope(
    chordTab: ChordTab,
    barredFret: number
  ): ChordTabEnvelope {
    const tabArray = chordTabToArray(chordTab);
    return {
      chordTab,
      barredFret,
      numFingers: Object.entries(chordTab).filter(
        ([stringNum, note]) =>
          note != null &&
          note != this.noteMatrix[parseInt(stringNum)][barredFret]
      ).length,
      totalFingerDistance: 0,
      bassOnBottom: tabArray[0] == this.bassNote,
    };
  }

  // private calculateTotalFingerDistance(chordTab: ChordTab) {
  //   return 0;
  // }

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
    prioritizedChordNotes: NoteLiteral[],
    bassNote: NoteLiteral
  ) {
    this.noteMatrix = noteMatrix;
    this.prioritizedChordNotes = prioritizedChordNotes;
    this.bassNote = bassNote;
  }

  public addChordTab(chordTab: ChordTab, barredFret: number) {
    const stringifiedTab = JSON.stringify(chordTab);
    if (this.existingStringifiedTabs.has(stringifiedTab)) return;

    const chord = this.buildChordTabEnvelope(chordTab, barredFret);

    this.existingStringifiedTabs.add(JSON.stringify(chordTab));
    this.chordTabQueue.enqueue(chord);
  }

  public popChordTab() {
    const chord = this.chordTabQueue.pop();
    return chord;
  }

  public toArray() {
    return this.chordTabQueue.toArray();
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
