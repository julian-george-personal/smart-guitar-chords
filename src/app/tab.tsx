"use client";

import { createContext, useContext } from "react";
import { RxCircle, RxCross1 } from "react-icons/rx";

type TabContextType = {
  fretCount: number;
};

const TabContext = createContext<TabContextType | null>(null);

interface TabProps {
  fretCount: number;
}

export default function Tab({ fretCount }: TabProps) {
  return (
    <TabContext.Provider value={{ fretCount }}>
      <div className="h-64 w-64 relative">
        <Box />
        <div className="absolute w-full h-full top-0 flex flex-row">
          <String isOpen fretNumber={0} />
          <String isOpen fretNumber={0} />
          <String isOpen fretNumber={2} />
          <String isOpen fretNumber={3} />
          <String isOpen fretNumber={4} />
        </div>
      </div>
    </TabContext.Provider>
  );
}

interface StringProps {
  isOpen: boolean;
  // indexed at 0
  fretNumber: number;
}

function String({ isOpen, fretNumber }: StringProps) {
  const tabContext = useContext(TabContext);
  if (!tabContext) return null;
  const sizePercent = Math.round((1 / tabContext.fretCount / 2) * 100);
  const topPercent =
    Math.round((fretNumber / tabContext.fretCount) * 100) +
    (100 / tabContext.fretCount - sizePercent) / 2;
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
        <div
          style={{
            height: `${sizePercent}%`,
            top: `${topPercent}%`,
          }}
          className={`rounded-full bg-black absolute aspect-square`}
        />
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
