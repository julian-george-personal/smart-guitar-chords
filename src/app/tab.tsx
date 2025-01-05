"use client";

import { createContext, useContext, useMemo } from "react";
import { RxCircle, RxCross1 } from "react-icons/rx";
import {
  getNumFrets,
  getChordNotesPerString,
  getChordNameFromNotes,
} from "./music_util";

type TabContextType = {
  fretCount: number;
};

const TabContext = createContext<TabContextType | null>(null);

interface TabProps {
  fretCount: number;
  chordName: string;
}

export default function Tab({ fretCount, chordName }: TabProps) {
  const stringTunings = ["E", "A", "D", "G", "B", "E"];
  const stringNotes = getChordNotesPerString(
    chordName,
    stringTunings,
    fretCount
  );
  return (
    <TabContext.Provider value={{ fretCount }}>
      <div className="h-64 w-64 relative">
        <Box />
        <div className="absolute w-full h-full top-0 flex flex-row">
          {stringTunings.map((tuning, i) => (
            <TunedString
              isOpen
              baseNote={tuning}
              currNote={stringNotes[i]}
              key={i}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="flex flex-row gap-1">
          {stringNotes.map((note) => note && <div>{note}</div>)}
        </div>
        <div>
          {getChordNameFromNotes(stringNotes.filter((note) => note != null))}
        </div>
      </div>
    </TabContext.Provider>
  );
}

interface TunedStringProps {
  isOpen: boolean;
  baseNote: string;
  currNote: string | null;
}

function TunedString({ isOpen, baseNote, currNote }: TunedStringProps) {
  const tabContext = useContext(TabContext);
  if (!tabContext) return null;
  const fretNumber = useMemo(() => {
    const numSemitones = getNumFrets(baseNote, currNote);
    if (numSemitones == null || numSemitones >= tabContext.fretCount) {
      return null;
    }
    return numSemitones;
  }, [baseNote, currNote]);
  return (
    <String isOpen={isOpen && fretNumber != null} fretNumber={fretNumber} />
  );
}

interface StringProps {
  isOpen: boolean;
  // indexed at 0
  fretNumber: number | null;
}

function String({ isOpen, fretNumber }: StringProps) {
  const tabContext = useContext(TabContext);
  if (!tabContext) return null;
  const dotSize = useMemo(
    () => Math.round((1 / tabContext.fretCount / 2) * 100),
    [fretNumber, tabContext]
  );
  const topPercent = useMemo(() => {
    if (!isOpen || fretNumber == null) return 0;
    const fingerBoardOffset = Math.round(
      ((fretNumber - 1) / tabContext.fretCount) * 100
    );
    const fretHeight = 100 / tabContext.fretCount;
    return fingerBoardOffset + (fretHeight - dotSize) / 2;
  }, [fretNumber, tabContext, dotSize, isOpen]);
  return (
    <div className="h-full centered flex-grow">
      <div className="h-[15%] w-full centered">
        {isOpen ? (
          <RxCircle className="h-4/5 w-4/5" />
        ) : (
          <RxCross1 className="h-4/5 w-4/5" />
        )}
      </div>
      <div className="w-full flex-grow centered relative">
        <div className="flex-grow w-full flex flex-row">
          <div className="h-full flex-grow border-r border-solid border-black" />
          <div className="h-full flex-grow border-l border-solid border-black" />
        </div>
        {isOpen && fretNumber != 0 && (
          <div
            style={{
              height: `${dotSize}%`,
              top: `${topPercent}%`,
            }}
            className={`rounded-full bg-black absolute aspect-square`}
          />
        )}
      </div>
    </div>
  );
}

function Box() {
  const tabContext = useContext(TabContext);
  if (!tabContext) return null;
  return (
    <div className="centered w-full h-full">
      <div className="h-[15%] w-full" />
      <div className="flex flex-col w-full border-y border-solid border-black flex-grow">
        {Array.from({ length: tabContext.fretCount }, (_, index) => (
          <div
            key={index}
            className="border-y border-solid border-black w-full flex-grow"
          />
        ))}
      </div>
    </div>
  );
}
