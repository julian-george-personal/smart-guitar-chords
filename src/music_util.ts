import { Note, Chord, Interval, transpose, NoteLiteral, note } from "tonal";
import { ICompare, PriorityQueue } from "@datastructures-js/priority-queue";

export type StringObj = {
  [stringNum: number]: NoteLiteral | null;
};

export function normalizeNote(noteName: NoteLiteral): NoteLiteral {
  const chroma = Note.chroma(noteName);
  return ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][
    chroma
  ];
}

export function getNumFrets(baseNote: NoteLiteral, currNote: NoteLiteral) {
  return (
    Number(
      Interval.semitones(Interval.simplify(Note.distance(baseNote, currNote)))
    ) % 12
  );
}

export function getNoteFromNumFrets(baseNote: NoteLiteral, numFrets: number) {
  return Note.tr(baseNote, Interval.fromSemitones(numFrets));
}
