import { useCallback, useContext, useMemo, useState } from "react";
import { getNumFrets } from "./music_util";
import { TabContext } from "./context";
import { RxCircle, RxCross1 } from "react-icons/rx";

interface TunedStringProps {
  baseNote: string;
  currNote: string | null;
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
  if (!tabContext) return null;
  const fretNumber = useMemo(() => {
    const numSemitones = getNumFrets(baseNote, currNote);
    if (numSemitones == null || numSemitones >= tabContext.fretCount) {
      return null;
    }
    return numSemitones;
  }, [baseNote, currNote]);
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
  if (!tabContext) return null;
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
  return (
    <div className="h-full centered flex-grow">
      <div
        className="h-[15%] w-full centered"
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
      <div className="w-full flex-grow centered relative">
        <div className="flex-grow w-full h-full flex flex-row absolute -z-10">
          <div className="h-full flex-grow border-r border-solid border-black" />
          <div className="h-full flex-grow border-l border-solid border-black" />
        </div>
        <div className="centered w-full h-full">
          {Array.from(Array(tabContext.fretCount).keys()).map((fretIdx) => {
            const isTabbed = fretNumber != null && fretIdx == fretNumber - 1;
            const isHovered = fretIdx == hoveredFretIdx;
            return (
              <div
                key={fretIdx}
                className="w-full centered"
                style={{
                  height: `${Math.round(100 / tabContext.fretCount)}%`,
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
                    <div className="rounded-full aspect-square h-1/2 bg-black" />
                  ) : (
                    !isHovered && (
                      <div className="rounded-full aspect-square h-1/2 bg-neutral-400" />
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
