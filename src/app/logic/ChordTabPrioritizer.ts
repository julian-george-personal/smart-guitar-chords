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
  numChordNotesMissing: number;
  isValid: boolean;
  numStringsUnvoiced: number;
};

// Ideas to improve this:
// 1. use exponential rates: it should be worse not voice 3 strings than 2
// 2. including total finger distance
// In the end though, we should give users the ability to choose from the top tabs in the priority queue.
function getPriority(chordTabEnvelope: ChordTabEnvelope) {
  const {
    numFingers,
    barredFret,
    bassOnBottom,
    numChordNotesMissing,
    isValid,
    numStringsUnvoiced,
  } = chordTabEnvelope;
  const priority =
    numFingers +
    numStringsUnvoiced +
    (barredFret > 0 ? 2.1 : 0) +
    (!bassOnBottom ? 2.1 : 0) +
    (numChordNotesMissing > 0 ? 2.2 : 0) +
    (!isValid ? 5 : 0);
  return priority;
}

export default class ChordTabPrioritizer {
  private noteMatrix: NoteLiteral[][];
  private allChordNotes: Set<NoteLiteral>;
  private prioritizedChordNotes: NoteLiteral[];
  private existingStringifiedTabs: Set<string> = new Set();
  private bassNote: NoteLiteral;

  private compareTabs: ICompare<ChordTabEnvelope> = (
    a: ChordTabEnvelope,
    b: ChordTabEnvelope
  ) => {
    const [aPriority, bPriority] = [getPriority(a), getPriority(b)];

    const comparison = comparePriorities(aPriority, bPriority);

    if (comparison != null) {
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
    const voicedNotes = tabArray.filter((x) => x != null);
    return {
      chordTab,
      barredFret,
      numFingers: Object.entries(chordTab).filter(
        ([stringNum, note]) =>
          note != null &&
          note != this.noteMatrix[parseInt(stringNum)][barredFret]
      ).length,
      totalFingerDistance: 0,
      bassOnBottom: voicedNotes[0] == this.bassNote,
      numChordNotesMissing: this.allChordNotes.difference(new Set(voicedNotes))
        .size,
      isValid: chordNotesAreValid(
        chordTab,
        this.prioritizedChordNotes,
        this.noteMatrix.map((s) => s[barredFret]),
        barredFret != 0
      ),
      numStringsUnvoiced: tabArray.length - voicedNotes.length,
    };
  }

  public constructor(
    noteMatrix: NoteLiteral[][],
    prioritizedChordNotes: NoteLiteral[],
    bassNote: NoteLiteral
  ) {
    this.noteMatrix = noteMatrix;
    this.prioritizedChordNotes = prioritizedChordNotes;
    this.allChordNotes = new Set(prioritizedChordNotes);
    this.bassNote = bassNote;
  }

  public addChordTab(chordTab: ChordTab, barredFret: number) {
    const stringifiedTab = JSON.stringify(chordTab);
    if (this.existingStringifiedTabs.has(stringifiedTab)) {
      return;
    }

    const chordEnvelope = this.buildChordTabEnvelope(chordTab, barredFret);

    this.existingStringifiedTabs.add(stringifiedTab);
    this.chordTabQueue.enqueue(chordEnvelope);
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

// TODO: this should use finger distance in some way
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
  ) {
    return false;
  }

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
