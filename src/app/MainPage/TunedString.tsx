import { useCallback, useContext, useMemo, useState } from "react";
import { getNoteFromNumFrets, getNumFrets } from "../logic/music_util";
import { TabContext } from "../state/tab/tab-context";
import { RxCircle, RxCross1 } from "react-icons/rx";
import { NoteLiteral } from "tonal";

interface TunedStringProps {
  baseNote: NoteLiteral;
  currNote: NoteLiteral | null;
  onFretChange: (fretNum: number | null) => void;
  interactive?: boolean;
}

export function TunedString({
  baseNote,
  currNote,
  onFretChange,
  interactive,
}: TunedStringProps) {
  const tabContext = useContext(TabContext);
  const fretNumber = useMemo(() => {
    if (currNote == null || !tabContext) return null;
    const { fretCount, startingFretNum } = tabContext;
    let numSemitones = getNumFrets(baseNote, currNote);
    if (numSemitones == 0) return 0;
    numSemitones = getNumFrets(getNoteFromNumFrets(baseNote, startingFretNum), currNote)
    if (numSemitones > fretCount) {
      return null;
    }
    return numSemitones;
  }, [baseNote, currNote, tabContext]);
  if (!tabContext) return null;
  return (
    <String
      fretNumber={fretNumber}
      onFretChange={onFretChange}
      interactive={interactive}
    />
  );
}

interface StringProps {
  fretNumber: number | null;
  onFretChange: (fretNum: number | null) => void;
  interactive?: boolean;
}

function String({ fretNumber, onFretChange, interactive }: StringProps) {
  const tabContext = useContext(TabContext);
  const [hoveredFretIdx, setHoveredFretIdx] = useState<
    number | null | undefined
  >();
  const setHoveredFretIdxIfInteractive = useCallback(
    (fretIdx: number | null | undefined) => {
      if (interactive) setHoveredFretIdx(fretIdx);
    },
    [interactive, setHoveredFretIdx]
  );
  const onFretChangeIfInteractive = useCallback(
    (fretNum: number | null) => {
      if (interactive) onFretChange(fretNum);
    },
    [interactive, onFretChange]
  );
  if (!tabContext) return null;
  return (
    <div className="h-full centered-col grow">
      <div
        className="h-10 w-full centered-col"
        style={{
          cursor: hoveredFretIdx === null ? "pointer" : "default",
        }}
        onMouseEnter={() =>
          setHoveredFretIdxIfInteractive(fretNumber == null ? 0 : null)
        }
        onMouseLeave={() => setHoveredFretIdxIfInteractive(undefined)}
        onClick={() => {
          if (fretNumber == null) {
            onFretChangeIfInteractive(0);
          } else {
            onFretChangeIfInteractive(null);
          }
          setHoveredFretIdxIfInteractive(undefined);
        }}
      >
        {(
          hoveredFretIdx === undefined
            ? fretNumber != null
            : hoveredFretIdx != null
        ) ? (
          <RxCircle className="h-4/5 w-4/5" />
        ) : (
          <RxCross1 className="h-4/5 w-4/5" />
        )}
      </div>
      <div className="w-full h-48 sm:h-64 centered-col relative">
        <div className="w-full h-full centered-row absolute">
          <div className="h-full grow border-r border-solid border-black" />
          <div className="h-full grow border-l border-solid border-black" />
        </div>
        <div className="centered-col w-full h-full z-10">
          {Array.from(Array(tabContext.fretCount).keys()).map((fretIdx) => {
            const isTabbed = fretNumber != null && fretIdx == fretNumber - 1;
            const isHovered = fretIdx == hoveredFretIdx;
            return (
              <div
                key={fretIdx}
                className="w-full centered-col grow"
                style={{
                  cursor: isHovered ? "pointer" : "default",
                }}
                onMouseEnter={() => setHoveredFretIdxIfInteractive(fretIdx)}
                onMouseLeave={() => {
                  if (isHovered) {
                    setHoveredFretIdxIfInteractive(undefined);
                  }
                }}
                onClick={() => {
                  setHoveredFretIdxIfInteractive(undefined);
                  onFretChangeIfInteractive(isTabbed ? 0 : fretIdx + 1);
                }}
              >
                {isTabbed &&
                  (hoveredFretIdx === undefined ? (
                    <div className="rounded-full aspect-square h-1/2 bg-black z-3" />
                  ) : (
                    !isHovered && (
                      <div className="rounded-full aspect-square h-1/2 bg-neutral-400 z-1" />
                    )
                  ))}
                {isHovered &&
                  (!isTabbed || hoveredFretIdx != fretNumber - 1) && (
                    <div className="rounded-full bg-neutral-500 aspect-square h-1/2" />
                  )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
