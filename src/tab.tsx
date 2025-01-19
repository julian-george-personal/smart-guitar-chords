import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getChordNameFromNotes,
  getChordNotesPerString,
  getNoteFromNumFrets,
  getNumFrets,
} from "./music_util";
import { TabContext } from "./context";
import { TunedString } from "./TunedString";

interface TabProps {
  fretCount: number;
  chordName: string;
  defaultStartingFretNum: number;
  interactiveStartingFretNum: boolean;
  stringTunings: string[];
}

export default function Tab({
  fretCount,
  chordName,
  defaultStartingFretNum,
  interactiveStartingFretNum,
  stringTunings,
}: TabProps) {
  const [manualStringNotes, setManualStringNotes] = useState<{
    [stringNum: number]: string | null;
  }>({});
  const [startingFretNum, setStartingFretNum] = useState(
    defaultStartingFretNum
  );
  const [stringNotes, setStringNotes] = useState<(string | null)[] | null>(
    null
  );
  const [relativeFretNumToBar, setRelativeFretNumToBar] = useState<number>(0);
  const stringCount = useMemo(() => stringTunings.length, [stringTunings]);
  const tabBaseNotes = useMemo(
    () =>
      stringTunings.map((tuning) =>
        getNoteFromNumFrets(tuning, startingFretNum)
      ),
    [startingFretNum]
  );
  useEffect(() => {
    setStartingFretNum(defaultStartingFretNum);
  }, [defaultStartingFretNum, setStartingFretNum]);
  useEffect(() => {
    const [newStringNotes, newRelativeFretNumToBar] = getChordNotesPerString(
      chordName,
      tabBaseNotes,
      [0, fretCount],
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
  ]);
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
  useEffect(() => {
    if (relativeFretNumToBar == 0 || stringNotes == null) return;
    if (
      stringNotes.filter(
        (stringNote, i) =>
          stringNote != null &&
          getNumFrets(stringTunings[i], stringNote) < relativeFretNumToBar
      ).length > 0
    ) {
      setRelativeFretNumToBar(0);
    }
  }, [
    stringNotes,
    stringTunings,
    relativeFretNumToBar,
    relativeFretNumToBar,
    setRelativeFretNumToBar,
  ]);
  if (stringNotes == null) return null;
  return (
    <TabContext.Provider value={{ fretCount, stringCount }}>
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
                  onFretChange={(newFret) => {
                    setManualStringNote(i, newFret);
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
      </div>
    </TabContext.Provider>
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
