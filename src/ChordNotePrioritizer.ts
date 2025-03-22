import { ICompare, PriorityQueue } from "@datastructures-js/priority-queue";
import { NoteLiteral } from "tonal";
import { comparePriorities } from "./util";

function getBassPriority(guitarNote: GuitarNote) {
  const { fretNum, stringNum } = guitarNote;
  return fretNum + 1 + (stringNum + 1) * 1.1;
}

type GuitarNote = { note: string; stringNum: number; fretNum: number };

export default class ChordNotePrioritizer {
  private chordNotePriorities: { [chordNote: string]: number } = {};
  private usedChordNotes: Set<NoteLiteral> = new Set();
  private enforceBassNote: boolean;
  private bassNote: NoteLiteral;
  private poppedGuitarNotes: GuitarNote[] = [];

  private compareNotes: ICompare<GuitarNote> = (
    a: GuitarNote,
    b: GuitarNote
  ) => {
    let [aPriority, bPriority] = [
      this.chordNotePriorities?.[a.note as string] ?? Infinity,
      this.chordNotePriorities?.[b.note as string] ?? Infinity,
    ];
    let comparison = comparePriorities(aPriority, bPriority);
    if (comparison != null) return comparison;

    if (
      this.enforceBassNote &&
      a.note == b.note &&
      !this.usedChordNotes.has(a.note) &&
      a.note == this.bassNote
    ) {
      [aPriority, bPriority] = [getBassPriority(a), getBassPriority(b)];
      comparison = comparePriorities(aPriority, bPriority);
      if (comparison != null) return comparison;
    }
    [aPriority, bPriority] = [a.fretNum, b.fretNum];
    comparison = comparePriorities(aPriority, bPriority);
    if (comparison != null) return comparison;

    [aPriority, bPriority] = [a.stringNum, b.stringNum];
    comparison = comparePriorities(aPriority, bPriority);
    if (comparison != null) return comparison;

    return 0;
  };

  private chordNoteQueue: PriorityQueue<GuitarNote> =
    new PriorityQueue<GuitarNote>(this.compareNotes);

  private refreshChordNoteQueue() {
    this.chordNoteQueue = PriorityQueue.fromArray(
      this.chordNoteQueue.toArray(),
      this.compareNotes
    );
  }

  public constructor(
    prioritizedChordNotes: NoteLiteral[],
    enforceBassNote: boolean
  ) {
    for (let i = 0; i < prioritizedChordNotes.length; i++) {
      this.chordNotePriorities[prioritizedChordNotes[i] as string] = i;
    }
    this.enforceBassNote = enforceBassNote;
    this.bassNote = prioritizedChordNotes[0];
  }

  public addGuitarNote(guitarNote: GuitarNote) {
    this.chordNoteQueue.enqueue(guitarNote);
  }

  public popGuitarNote(): GuitarNote | null {
    const poppedGuitarNote = this.chordNoteQueue.pop();
    if (poppedGuitarNote != null) this.poppedGuitarNotes.push(poppedGuitarNote);
    return poppedGuitarNote;
  }

  public useGuitarNote(guitarNote: GuitarNote) {
    const note = guitarNote.note;
    if (!this.usedChordNotes.has(note)) {
      delete this.chordNotePriorities[note];
      this.usedChordNotes.add(note);
    }
    this.refreshChordNoteQueue();
  }
}
