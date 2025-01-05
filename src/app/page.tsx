"use client";

import { useState } from "react";
import Tab from "./tab";

export default function Home() {
  const [chordName, setChordName] = useState("C");
  return (
    <main className="font-sans h-screen centered gap-8">
      <div className="text-4xl font-medium">Smart Guitar Chords</div>
      <div className="w-1/2 border-2 border-gray-300 border-solid rounded-md centered p-8">
        <input
          value={chordName}
          onChange={(newValue) => setChordName(newValue.target.value)}
        />
        <Tab fretCount={5} chordName={chordName} />
      </div>
    </main>
  );
}
