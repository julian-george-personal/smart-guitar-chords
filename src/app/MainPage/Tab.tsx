import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getNoteFromNumFrets } from "../logic/music_util";
import {
  getChordNameFromNotes,
  getBestTabsForChord,
  NotesAndBarredFret,
} from "../logic/chord_calculator";
import { TabContext, TabProvider } from "../context/tab-context";
import { TunedString } from "./TunedString";
import { useTabByKey } from "../context/song-context";
import { RxArrowDown, RxArrowLeft, RxArrowRight, RxArrowUp } from "react-icons/rx";

interface TabProps {
  tabKey: number;
}

export default function Tab({ tabKey }: TabProps) {
  const {
    tab,
    setManualStringNote,
    resetManualStringNote,
    resetAllManualStringNotes,
    incrementStartingFretNum,
    incrementVoicingIdx
  } = useTabByKey(tabKey);
  const {
    stringTunings,
    startingFretNum,
    capoFretNum,
    chordName,
    fretCount,
    manualStringNotes,
    voicingIdx,
  } = tab;

  const [voicingOptions, setVoicingOptions] = useState<NotesAndBarredFret[]>([])
  const currentVoicing = useMemo(() => voicingOptions[voicingIdx], [voicingIdx, voicingOptions])

  const tabBaseNotes = useMemo(
    () =>
      stringTunings.map((tuning) =>
        getNoteFromNumFrets(tuning, capoFretNum)
      ),
    [capoFretNum, stringTunings]
  );

  // The voicing is calculated here:
  useEffect(() => {
    const voicings = getBestTabsForChord(
      chordName,
      tabBaseNotes,
      startingFretNum,
      fretCount,
      manualStringNotes
    );
    setVoicingOptions(voicings);
  }, [
    manualStringNotes,
    chordName,
    tabBaseNotes,
    fretCount,
    setVoicingOptions
  ]);

  const setManualStringFretNum = useCallback(
    (stringNum: number, newFretNum: number | null) => {
      const startingFretNotes = stringTunings.map((baseNote) =>
        getNoteFromNumFrets(baseNote, startingFretNum)
      )
      setManualStringNote(
        stringNum,
        newFretNum == null
          ? null
          : getNoteFromNumFrets(startingFretNotes[stringNum], newFretNum)
      );
    },
    [setManualStringNote, stringTunings]
  );

  if (currentVoicing == null) return null;
  return (
    <TabProvider tabKey={tabKey}>
      <div className="centered-row w-full max-w-80">
        <div className="w-8 h-full">
          <div className="h-[2.15rem]" />
          <div className="centered-col justify-center position-relative">
            {startingFretNum != 0 ?
              <>
                <RxArrowUp className="cursor-pointer stroke-[1] sm:h-4 sm:w-4 h-6 w-6" onClick={() => incrementStartingFretNum(-1)} />
                <div className="h-6">{startingFretNum + 1}</div>
              </> :
              <div className="sm:h-10 h-12" />
            }
            <RxArrowDown className="cursor-pointer stroke-[1] sm:h-4 sm:w-4 h-6 w-6" onClick={() => incrementStartingFretNum(1)} />
          </div>
        </div>
        <div className="w-full aspect-square">
          <div className="w-full h-[90%] relative">
            <Box fretNumToBar={currentVoicing.fretNumToBar} />
            <div className="absolute w-full h-full top-0 centered-row">
              {tabBaseNotes.map((baseNote, i) => (
                <TunedString
                  baseNote={baseNote}
                  currNote={currentVoicing.stringNotes[i]}
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
            {currentVoicing.stringNotes.map((note, stringIdx) => {
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
          <div className="centered-col">
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
                currentVoicing.stringNotes.filter((note) => note != null),
                chordName
              ) ?? "???"}
            </div>
            <div className="flex flex-row items-center justify-center gap-2 w-full">
              <div className="basis-1/3 flex flex-row justify-end">
                {voicingIdx != 0 && <RxArrowLeft className="stroke-1 cursor-pointer" onClick={() => {
                  incrementVoicingIdx(-1, voicingOptions.length)
                }} />}
              </div>
              <div className="text-sm text-center">{voicingIdx + 1} of {voicingOptions.length}</div>
              <div className="basis-1/3 flex flex-row justify-start">
                {voicingIdx != voicingOptions.length - 1 && <RxArrowRight className="stroke-1 cursor-pointer" onClick={() => {
                  incrementVoicingIdx(1, voicingOptions.length)
                }} />}
              </div>
            </div>
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
