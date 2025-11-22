import { NoteLiteral } from "tonal";
import { ChordTab } from "../../logic/music_util";

export type TTab = {
    chordName: string;
    manualStringNotes: ChordTab;
    fretCount: number;
    startingFretNum: number;
    capoFretNum: number;
    voicingIdx: number;
    // These include octave nums, but they're relative. i.e. on the high E string in standard tuning, F1 is fret 1 and F2 is fret 13
    stringTunings: NoteLiteral[];
    voicesChord: boolean;
  };

  export type TChord = {
    id: string;
    chordName: string;
    index: number;
    tab?: TTab;
  }
  
  export type TSong = {
    title?: string;
    fretCount: number;
    capoFretNum: number;
    stringTunings: NoteLiteral[];
    chords: TChord[];
  };