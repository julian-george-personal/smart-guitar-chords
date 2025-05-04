import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getNoteFromNumFrets, getNumFrets } from "../music_util";
import {
  getChordNameFromNotes,
  getChordNotesPerString,
} from "../chord_calculator";
import { TabContext, TabProvider } from "../context/tab-context";
import { TunedString } from "./TunedString";
import { NoteLiteral } from "tonal";
import { useTabByKey } from "../context/song-context";

interface TabProps {
  tabKey: number;
}

export default function Tab({ tabKey }: TabProps) {
  const {
    tab,
    setManualStringNote,
    resetManualStringNote,
    resetAllManualStringNotes,
    setStartingFretNum,
  } = useTabByKey(tabKey);
  const {
    stringTunings,
    startingFretNum,
    chordName,
    fretCount,
    manualStringNotes,
  } = tab;
  const [interactiveStartingFretNum, setInteractiveStartingFretNum] =
    useState<boolean>(false);
  const startingFretNotes = useMemo(
    () =>
      stringTunings.map((baseNote) =>
        getNoteFromNumFrets(baseNote, startingFretNum)
      ),
    [stringTunings, startingFretNum]
  );
  const [stringNotes, setStringNotes] = useState<(NoteLiteral | null)[] | null>(
    null
  );
  const [relativeFretNumToBar, setRelativeFretNumToBar] = useState<number>(0);
  const tabBaseNotes = useMemo(
    () =>
      stringTunings.map((tuning) =>
        getNoteFromNumFrets(tuning, startingFretNum)
      ),
    [startingFretNum, stringTunings]
  );
  useEffect(() => {
    const [newStringNotes, newRelativeFretNumToBar] = getChordNotesPerString(
      chordName,
      tabBaseNotes,
      fretCount,
      manualStringNotes
    );
    setStringNotes(newStringNotes);
    setRelativeFretNumToBar(newRelativeFretNumToBar);
  }, [
    manualStringNotes,
    chordName,
    tabBaseNotes,
    setStringNotes,
    setRelativeFretNumToBar,
    fretCount,
  ]);

  useEffect(() => {
    if (stringNotes == null) return;
    if (
      stringNotes.filter(
        (stringNote, i) =>
          stringNote != null &&
          getNumFrets(startingFretNotes[i], stringNote) < relativeFretNumToBar
      ).length > 0
    ) {
      setRelativeFretNumToBar(0);
    }
  }, [
    stringNotes,
    startingFretNotes,
    relativeFretNumToBar,
    setRelativeFretNumToBar,
  ]);
  const setManualStringFretNum = useCallback(
    (stringNum: number, newFretNum: number | null) => {
      setManualStringNote(
        stringNum,
        newFretNum == null
          ? null
          : getNoteFromNumFrets(startingFretNotes[stringNum], newFretNum)
      );
    },
    [setManualStringNote, startingFretNotes]
  );
  if (stringNotes == null || stringTunings.length == 0) return null;
  return (
    <TabProvider tabKey={tabKey}>
      <div className="centered-row aspect-square w-full max-w-80">
        {interactiveStartingFretNum && (
          <div className="w-1/6">
            <div className="top-[15%] relative align-right w-full text-lg">
              (
              <input
                value={startingFretNum}
                onChange={(newValue) => {
                  const newNumber = parseInt(newValue.target.value);
                  if (newNumber >= 0) setStartingFretNum(newNumber);
                }}
                type="number"
                className="w-full"
              />
              )
            </div>
          </div>
        )}
        <div className="w-full h-full">
          <div className="w-full h-[90%] relative">
            <Box fretNumToBar={relativeFretNumToBar} />
            <div className="absolute w-full h-full top-0 centered-row">
              {tabBaseNotes.map((baseNote, i) => (
                <TunedString
                  baseNote={baseNote}
                  currNote={stringNotes[i]}
                  key={i}
                  onFretChange={(newFretNum) => {
                    setManualStringFretNum(i, newFretNum);
                  }}
                  interactive
                />
              ))}
            </div>
          </div>
          <div className="w-full h-[10%] centered-row">
            {stringNotes.map((note, stringIdx) => {
              const isModified = stringIdx in manualStringNotes;
              return (
                <div
                  key={stringIdx}
                  className="text-center grow"
                  style={{
                    fontStyle: isModified ? "italic" : "normal",
                    cursor: isModified ? "pointer" : "default",
                    fontWeight: isModified ? "bold" : "normal",
                  }}
                  onClick={() => resetManualStringNote(stringIdx)}
                >
                  {note?.toString() || "X"}
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
            onClick={resetAllManualStringNotes}
          >
            {getChordNameFromNotes(
              stringNotes.filter((note) => note != null),
              chordName
            ) ?? "???"}
          </div>
        </div>
      </div>
    </TabProvider>
  );
}

interface BoxProps {
  fretNumToBar: number;
}

function Box({ fretNumToBar }: BoxProps) {
  const tabContext = useContext(TabContext);
  if (!tabContext) return null;
  return (
    <div className="centered-col w-full h-full">
      <div className="h-[15%] w-full" />
      <div className="centered-col w-full h-[85%] border-y border-solid border-black grow">
        {Array.from({ length: tabContext.fretCount }, (_, idx) => (
          <div
            key={idx}
            className="centered-col border-y border-solid border-black w-full grow"
          >
            {idx + 1 == fretNumToBar && <Bar />}
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar() {
  return <div className="w-full h-1/2 bg-black rounded-lg z-2"></div>;
}
