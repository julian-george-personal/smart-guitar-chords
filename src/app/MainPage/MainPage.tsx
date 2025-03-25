import { useCallback, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Tab from "./Tab";
import { useAccountData } from "../context/account-context";
import AccountModal from "./AccountModal/AccountModal";

export default function MainPage() {
  const { account, recoverPasswordToken } = useAccountData();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  useEffect(() => {
    if (recoverPasswordToken != null) setIsAccountModalOpen(true);
  }, [recoverPasswordToken]);
  const openAccountModal = useCallback(() => {
    setIsAccountModalOpen(true);
  }, [setIsAccountModalOpen]);
  const closeAccountModal = useCallback(() => {
    setIsAccountModalOpen(false);
  }, [setIsAccountModalOpen]);
  const [chordNames, setChordNames] = useState("C");
  const [startingFretNum, setStartingFretNum] = useState(0);
  const [stringTunings, setStringTunings] = useState([
    "E",
    "A",
    "D",
    "G",
    "B",
    "E",
  ]);
  return (
    <>
      <AccountModal
        isOpen={isAccountModalOpen}
        closeModal={closeAccountModal}
      />
      <header className="bg-white px-6 py-2 flex flex-row items-center justify-items-stretch">
        <div className="flex-1" />
        <div className="flex-1 flex flex-row justify-center">
          <div className="text-xl">Smart Guitar Chords</div>
        </div>
        <div className="flex-1 flex flex-row justify-end">
          <div onClick={openAccountModal} className="cursor-pointer">
            {account ? account.username : "Login"}
          </div>
        </div>
      </header>
      <main
        className="font-sans min-h-screen centered-col gap-4 grow"
        id="main"
      >
        <div className="centered-row gap-2">
          <div className="flex flex-col basis-1/3">
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
                    ? Math.max(0, parseInt(newValue.target.value))
                    : 0
                );
              }}
              type="number"
              className="bg-neutral-100 w-full px-1 py-1 rounded-md"
            />
          </div>
          <div className="flex flex-col basis-1/3">
            <span className="text-sm">String Tunings</span>
            <input
              value={stringTunings.join(",")}
              onChange={(newValue) => {
                setStringTunings(
                  newValue.target.value.split(",").map((x) => x.trim())
                );
              }}
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
      <ToastContainer />
    </>
  );
}
