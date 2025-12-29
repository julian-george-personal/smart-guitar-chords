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
  priority: number;
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
    totalFingerDistance,
  } = chordTabEnvelope;
  const priority =
    numFingers +
    numStringsUnvoiced +
    (barredFret > 0 ? 3.1 : 0) +
    (!bassOnBottom ? 2.1 : 0) +
    (numChordNotesMissing > 0 ? 2.2 : 0) +
    (!isValid ? 5 : 0) +
    totalFingerDistance * 0.75;
  return priority;
}

export default class ChordTabPrioritizer {
  private noteMatrix: NoteLiteral[][];
  private allChordNotes: Set<NoteLiteral>;
  private prioritizedChordNotes: NoteLiteral[];
  private existingStringifiedTabs: Set<string> = new Set();
  private bassNote: NoteLiteral;

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

  private compareTabs: ICompare<ChordTabEnvelope> = (
    a: ChordTabEnvelope,
    b: ChordTabEnvelope
  ) => {
    const [aPriority, bPriority] = [getPriority(a), getPriority(b)];

    a.priority = aPriority;
    b.priority = bPriority;

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
    totalFingerDistance: number,
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
      totalFingerDistance,
      bassOnBottom: voicedNotes[0] == this.bassNote,
      numChordNotesMissing: this.allChordNotes.difference(new Set(voicedNotes))
        .size,
      isValid: chordNotesAreValid(
        chordTab,
        this.prioritizedChordNotes,
        this.noteMatrix.map((s) => s[barredFret]),
        barredFret
      ),
      numStringsUnvoiced: tabArray.length - voicedNotes.length,
      priority: Infinity,
    };
  }

  public addChordTab(
    chordTab: ChordTab,
    totalFingerDistance: number,
    barredFret: number
  ) {
    const stringifiedTab = JSON.stringify(chordTab);
    if (this.existingStringifiedTabs.has(stringifiedTab)) {
      return;
    }

    const chordEnvelope = this.buildChordTabEnvelope(
      chordTab,
      totalFingerDistance,
      barredFret
    );

    this.existingStringifiedTabs.add(stringifiedTab);
    this.chordTabQueue.enqueue(chordEnvelope);
  }

  public popChordTab(): Required<ChordTabEnvelope> | null {
    const chord = this.chordTabQueue.pop() as Required<ChordTabEnvelope>;
    return chord;
  }

  private ScoreThreshold = 10;
  private MaxTabsToReturn = 10;

  public getBestTabs(): ChordTabEnvelope[] {
    const bestTabs: ChordTabEnvelope[] = [];

    while (bestTabs.length <= this.MaxTabsToReturn) {
      const tab = this.chordTabQueue.pop();
      if (
        tab != null &&
        (bestTabs.length == 0 ||
          (tab?.isValid && tab.priority < this.ScoreThreshold))
      ) {
        bestTabs.push(tab);
      } else break;
    }

    return bestTabs;
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
  barredFret: number
) {
  const stringNoteValues = chordTabToArray(stringNotes);
  const isBarred = barredFret != 0;

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
      (isBarred ? 1 : 0) >
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
