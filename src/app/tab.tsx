"use client";

import { useCallback, useContext, useMemo, useState } from "react";
import {
  getChordNameFromNotes,
  getChordNotesPerString,
  getNoteFromNumFrets,
} from "./music_util";
import { TabContext } from "./context";
import { TunedString } from "./string";

interface TabProps {
  fretCount: number;
  chordName: string;
}

export default function Tab({ fretCount, chordName }: TabProps) {
  const stringTunings = ["E", "A", "D", "G", "B", "E"];
  const [manualStringNotes, setManualStringNotes] = useState<{
    [stringNum: number]: string | null;
  }>({});
  const stringNotes = useMemo(
    () =>
      getChordNotesPerString(
        chordName,
        stringTunings,
        [0, fretCount],
        manualStringNotes
      ),
    [manualStringNotes, chordName]
  );
  const setManualStringNote = useCallback(
    (stringIdx: number, noteName: number | null) => {
      setManualStringNotes((prev) => {
        const updatedNotes = { ...prev };
        updatedNotes[stringIdx] =
          noteName == null
            ? null
            : getNoteFromNumFrets(stringTunings[stringIdx], noteName);
        return updatedNotes;
      });
    },
    [setManualStringNotes]
  );
  const resetManualStringNote = useCallback(
    (stringIdx: number) => {
      setManualStringNotes((prev) => {
        const updatedNotes = { ...prev };
        delete updatedNotes[stringIdx];
        return updatedNotes;
      });
    },
    [setManualStringNotes]
  );
  return (
    <TabContext.Provider value={{ fretCount }}>
      <div className="h-64 w-64">
        <div className="w-full h-[90%] relative">
          <Box />
          <div className="absolute w-full h-full top-0 flex flex-row">
            {stringTunings.map((tuning, i) => (
              <TunedString
                baseNote={tuning}
                currNote={stringNotes[i]}
                key={i}
                onFretChange={(newFret) => {
                  setManualStringNote(i, newFret);
                }}
                interactive
              />
            ))}
          </div>
        </div>
        <div className="flex flex-row w-full h-[10%]">
          {stringNotes.map((note, stringIdx) => {
            const isModified = stringIdx in manualStringNotes;
            return (
              <div
                key={stringIdx}
                className="w-1/6 text-center"
                style={{
                  fontStyle: isModified ? "italic" : "normal",
                  cursor: isModified ? "pointer" : "default",
                  fontWeight: isModified ? "bold" : "normal",
                }}
                onClick={() => resetManualStringNote(stringIdx)}
              >
                {note || "X"}
              </div>
            );
          })}
        </div>
        <div
          className="w-full text-center"
          style={
            Object.keys(manualStringNotes).length > 0
              ? {
                  fontStyle: "italic",
                  cursor: "pointer",
                  fontWeight: "bold",
                }
              : {}
          }
          onClick={() => setManualStringNotes({})}
        >
          {getChordNameFromNotes(
            stringNotes.filter((note) => note != null),
            chordName
          ) ?? "???"}
        </div>
      </div>
    </TabContext.Provider>
  );
}

function Box() {
  const tabContext = useContext(TabContext);
  if (!tabContext) return null;
  return (
    <div className="centered w-full h-full">
      <div className="h-[15%] w-full" />
      <div className="flex flex-col w-full border-y border-solid border-black flex-grow">
        {Array.from({ length: tabContext.fretCount }, (_, idx) => (
          <div
            key={idx}
            className="border-y border-solid border-black w-full flex-grow"
          />
        ))}
      </div>
    </div>
  );
}
