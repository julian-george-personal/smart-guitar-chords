import { useState } from "react";
import Tab from "./Tab";

export default function App() {
  const [chordNames, setChordNames] = useState("C");
  const [startingFretNum, setStartingFretNum] = useState(0);
  const [stringTunings, _] = useState(["E", "A", "D", "G", "B", "E"]);
  return (
    <main className="font-sans min-h-screen centered-col gap-4 grow">
      <div className="text-4xl font-medium">Smart Guitar Chords</div>
      <div className="centered-row gap-2">
        <div className="flex flex-col basis-2/3">
          <span className="text-sm">Chord Names</span>
          <input
            value={chordNames}
            onChange={(newValue) => setChordNames(newValue.target.value)}
            className="bg-neutral-100 w-full px-1 py-1 rounded-md"
          />
        </div>
        <div className="flex flex-col basis-1/3">
          <span className="text-sm">Starting Fret Number</span>
          <input
            value={startingFretNum}
            onChange={(newValue) => {
              setStartingFretNum(
                newValue.target.value != ""
                  ? parseInt(newValue.target.value)
                  : 0
              );
            }}
            type="number"
            className="bg-neutral-100 w-full px-1 py-1 rounded-md"
          />
        </div>
      </div>
      <div
        className="w-[80%] border-2 border-gray-300 border-solid rounded-md gap-8 p-8 grid justify-items-center"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
        }}
      >
        {chordNames.split(",").map((chordName, i) => (
          <Tab
            fretCount={5}
            chordName={chordName.trim()}
            defaultStartingFretNum={startingFretNum}
            interactiveStartingFretNum={false}
            stringTunings={stringTunings}
            key={i}
          />
        ))}
      </div>
    </main>
  );
}
