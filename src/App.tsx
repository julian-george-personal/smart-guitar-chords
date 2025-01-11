import { useState } from "react";
import Tab from "./tab";

export default function App() {
  const [chordNames, setChordNames] = useState("C");
  return (
    <main className="font-sans h-screen centered gap-8">
      <div className="text-4xl font-medium">Smart Guitar Chords</div>
      <input
        value={chordNames}
        onChange={(newValue) => setChordNames(newValue.target.value)}
        className="bg-neutral-100"
      />
      <div className="w-[80%] border-2 border-gray-300 border-solid rounded-md centered flex-row gap-8 p-8">
        {chordNames.split(",").map((chordName, i) => (
          <Tab fretCount={5} chordName={chordName.trim()} key={i} />
        ))}
      </div>
    </main>
  );
}
