import { ICompare, PriorityQueue } from "@datastructures-js/priority-queue";
import { NoteLiteral } from "tonal";
import { comparePriorities } from "../util";

function getBassPriority(guitarNote: GuitarNote) {
  const { fretNum, stringNum } = guitarNote;
  return fretNum + 1 + (stringNum + 1) * 1.1;
}

export type NotePosition = { stringNum: number, fretNum: number }
type GuitarNote = NotePosition & { note: NoteLiteral };

export default class ChordNotePrioritizer {
  private chordNotePriorities: { [chordNote: string]: number } = {};
  private usedChordNotes: Set<NoteLiteral> = new Set();
  private prioritizeBassNote: boolean;
  private bassNote: NoteLiteral;
  private poppedGuitarNotes: GuitarNote[] = [];

  private compareNotes: ICompare<GuitarNote> = (
    a: GuitarNote,
    b: GuitarNote
  ) => {
    // Prioritize unvoiced chord notes in order of importance in the chord
    let [aPriority, bPriority] = [
      this.chordNotePriorities?.[a.note as string] ?? Infinity,
      this.chordNotePriorities?.[b.note as string] ?? Infinity,
    ];
    let comparison = comparePriorities(aPriority, bPriority);
    if (comparison != null) {
      // console.log("a", comparison, a, b);
      return comparison;
    }

    // if we get to this point, a and b are the same note, and we're trying to find the best way to voice it

    // the best voicing of the bass note is on a lower string and lower fret number
    if (
      this.prioritizeBassNote &&
      a.note == this.bassNote &&
      !this.usedChordNotes.has(a.note)
    ) {
      [aPriority, bPriority] = [getBassPriority(a), getBassPriority(b)];
      comparison = comparePriorities(aPriority, bPriority);
      if (comparison != null) {
        // console.log("b", comparison, a, b);
        return comparison;
      }
    }

    // the best voicing of a non-bass note is on a lower fret number
    [aPriority, bPriority] = [a.fretNum, b.fretNum];
    comparison = comparePriorities(aPriority, bPriority);
    if (comparison != null) {
      // console.log("c", comparison, a, b);
      return comparison;
    }

    [aPriority, bPriority] = [a.stringNum, b.stringNum];
    comparison = comparePriorities(aPriority, bPriority);
    if (comparison != null) {
      // console.log("d", comparison, a, b);
      return comparison;
    }

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
    bassNote: NoteLiteral,
    enforceBassNote: boolean
  ) {
    this.bassNote = bassNote;
    this.prioritizeBassNote = enforceBassNote;
    for (let i = 0; i < prioritizedChordNotes.length; i++) {
      const note = prioritizedChordNotes[i];
      const priority =
        this.prioritizeBassNote && note == this.bassNote ? -1 : i;
      this.chordNotePriorities[note as string] = priority;
    }
  }

  public addGuitarNote(guitarNote: GuitarNote) {
    this.chordNoteQueue.enqueue(guitarNote);
  }

  public popGuitarNote(): GuitarNote | null {
    const poppedGuitarNote = this.chordNoteQueue.pop();
    if (poppedGuitarNote != null) this.poppedGuitarNotes.push(poppedGuitarNote);
    return poppedGuitarNote;
  }

  public useGuitarNote(guitarNote: GuitarNote): NotePosition {
    const note = guitarNote.note;
    if (!this.usedChordNotes.has(note)) {
      delete this.chordNotePriorities[note as string];
      this.usedChordNotes.add(note);
    }

    this.refreshChordNoteQueue();
    return { stringNum: guitarNote.stringNum, fretNum: guitarNote.fretNum }
  }

  public toArray() {
    return this.chordNoteQueue.toArray();
  }
}
