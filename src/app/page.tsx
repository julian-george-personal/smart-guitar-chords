import Tab from "./tab";

export default function Home() {
  return (
    <main className="font-sans h-screen centered gap-8">
      <div className="text-4xl font-medium">Smart Guitar Chords</div>
      <div className="w-1/2 border-2 border-gray-300 border-solid rounded-md centered p-8">
        <Tab fretCount={5} />
      </div>
    </main>
  );
}
