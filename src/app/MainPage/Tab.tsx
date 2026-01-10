import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  arrayToChordTab,
  chordTabToArray,
  getNoteFromNumFrets,
  sanitizeNoteNameForDisplay,
} from "../logic/music_util";
import {
  getChordNameFromNotes,
  getBestTabsForChord,
  NotesAndBarredFret,
} from "../logic/chord_calculator";
import { TunedString } from "./TunedString";
import {
  RxArrowDown,
  RxArrowLeft,
  RxArrowRight,
  RxArrowUp,
} from "react-icons/rx";
import { useTabById } from "../state/song/song-hooks";
import { TabContext } from "../state/tab/tab-context";
import { TabProvider } from "../state/tab/tab-provider";

interface TabProps {
  tabId: string;
}

export default function Tab({ tabId }: TabProps) {
  const {
    tab,
    setManualStringNote,
    resetManualStringNote,
    resetAllManualStringNotes,
    incrementStartingFretNum,
    resetVoicingIdx,
    incrementVoicingIdx,
    setVoicesChord,
  } = useTabById(tabId);
  const {
    stringTunings,
    startingFretNum,
    capoFretNum,
    chordName,
    fretCount,
    manualStringNotes,
    voicingIdx,
    voicesChord,
  } = tab;

  const [voicingOptions, setVoicingOptions] = useState<NotesAndBarredFret[]>(
    []
  );
  // This is used to keep the displayed fret number centered on the first fret
  const [firstFretRect, setFirstRowRect] = useState<DOMRect | null>();

  const currentVoicing = useMemo<NotesAndBarredFret | undefined>(
    () => voicingOptions[voicingIdx],
    [voicingIdx, voicingOptions]
  );

  const tabBaseNotes = useMemo(
    () =>
      stringTunings.map((tuning) => getNoteFromNumFrets(tuning, capoFretNum)),
    [capoFretNum, stringTunings]
  );

  // The voicing is calculated here:
  useEffect(
    () => {
      const voicings = getBestTabsForChord(
        chordName,
        tabBaseNotes,
        startingFretNum,
        fretCount,
        manualStringNotes
      );
      if (voicings.length > 0) {
        setVoicingOptions(voicings);
        setVoicesChord(true);
      } else {
        // If no voicings can be found, we still want to display an empty, changeable tab
        setVoicingOptions([
          {
            stringNotes: chordTabToArray({
              ...arrayToChordTab(stringTunings),
              ...manualStringNotes,
            }),
            fretNumToBar: 0,
          },
        ]);
        setVoicesChord(false);
      }
    },
    // Adding setVoicesChord here causes infinite rerenders
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      manualStringNotes,
      chordName,
      tabBaseNotes,
      fretCount,
      startingFretNum,
      stringTunings,
    ]
  );

  const setManualStringFretNum = useCallback(
    (stringNum: number, newFretNum: number | null) => {
      const startingFretNotes = tabBaseNotes.map((baseNote) =>
        getNoteFromNumFrets(baseNote, startingFretNum)
      );
      console.log(tabId, "tsx");
      setManualStringNote(
        stringNum,
        newFretNum == null
          ? null
          : getNoteFromNumFrets(
              newFretNum == 0
                ? stringTunings[stringNum]
                : startingFretNotes[stringNum],
              newFretNum
            )
      );
    },
    [setManualStringNote, tabBaseNotes, startingFretNum, stringTunings]
  );

  // This should only happen when the app is first loading
  if (!currentVoicing) return null;

  return (
    <TabProvider tabId={tabId}>
      <div className="centered-row w-full max-w-80">
        <div className="w-8 h-full">
          {startingFretNum == 0 ? (
            <div className="centered-col">
              <div className="h-10" />
              <RxArrowDown
                className="cursor-pointer stroke-[1] h-6 w-6"
                onClick={() => incrementStartingFretNum(1)}
              />
            </div>
          ) : (
            <div
              className="centered-col justify-start relative"
              style={{
                top: `calc(2.5rem - 2.25rem + ${
                  (firstFretRect?.height ?? 0) / 2
                }px)`,
              }}
            >
              <RxArrowUp
                className="cursor-pointer stroke-[1] h-6 w-6"
                onClick={() => incrementStartingFretNum(-1)}
              />
              <div className="centered-col h-6">
                <span>{startingFretNum + 1}</span>
              </div>
              <RxArrowDown
                className="cursor-pointer stroke-[1] h-6 w-6"
                onClick={() => incrementStartingFretNum(1)}
              />
            </div>
          )}
        </div>
        <div className="w-full">
          <div className="w-full h-[90%] relative">
            <Box
              fretNumToBar={currentVoicing.fretNumToBar}
              setFirstRowRect={setFirstRowRect}
            />
            <div className="absolute w-full top-0 centered-row">
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
          <div className="w-full h-10 centered-row">
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
                  {note ? sanitizeNoteNameForDisplay(note) : "X"}
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
            <div className="flex flex-row items-center justify-center gap-2 w-full text-sm">
              {voicesChord ? (
                <>
                  <div className="basis-1/3 flex flex-row justify-end">
                    {voicingIdx != 0 && (
                      <RxArrowLeft
                        className="stroke-1 cursor-pointer"
                        onClick={() => {
                          incrementVoicingIdx(-1, voicingOptions.length);
                        }}
                      />
                    )}
                  </div>
                  <div className="text-center">
                    {voicingIdx + 1} of {voicingOptions.length}
                  </div>
                  <div className="basis-1/3 flex flex-row justify-start">
                    {voicingIdx != voicingOptions.length - 1 && (
                      <RxArrowRight
                        className="stroke-1 cursor-pointer"
                        onClick={() => {
                          incrementVoicingIdx(1, voicingOptions.length);
                        }}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div>No voicings found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TabProvider>
  );
}

interface BoxProps {
  fretNumToBar: number;
  setFirstRowRect: (rect: DOMRect) => void;
}

function Box({ fretNumToBar, setFirstRowRect }: BoxProps) {
  const tabContext = useContext(TabContext);
  const firstRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!firstRowRef.current) return;

    const rect = firstRowRef.current?.getBoundingClientRect();
    if (rect) {
      setFirstRowRect(rect);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabContext?.fretCount]);

  if (!tabContext) return null;
  return (
    <div className="centered-col w-full h-full">
      <div className="h-10 w-full" />
      <div
        className="centered-col h-48 sm:h-64 border-y border-solid border-black max-w-[100%]"
        style={{
          aspectRatio: `${tabContext.stringCount + 1}/${
            tabContext.stringCount
          }`,
        }}
      >
        {Array.from({ length: tabContext.fretCount }, (_, idx) => (
          <div
            key={idx}
            className="centered-col border-y border-solid border-black w-full grow"
            ref={idx === 0 ? firstRowRef : undefined}
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
