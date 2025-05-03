import { memo, useCallback, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { AiOutlineSave } from "react-icons/ai";
import { RxPencil1 } from "react-icons/rx";
import Tab from "./Tab";
import { useAccountData } from "../context/account-context";
import AccountModal from "./AccountModal/AccountModal";
import { useSongData } from "../context/song-context";
import MultiStringInput from "./MultiStringInput";
import { sanitizeNoteName } from "../music_util";
import SongModal from "./SongModal/SongModal";

const MemoizedTab = memo(Tab);

export default function MainPage() {
  const { account, recoverPasswordToken } = useAccountData();
  const { song, setChordNames, setSongStringTunings, setSongStartingFretNum } =
    useSongData();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isSongModalOpen, setIsSongModalOpen] = useState<boolean>(false);
  useEffect(() => {
    if (recoverPasswordToken != null) setIsAccountModalOpen(true);
  }, [recoverPasswordToken]);
  const openAccountModal = useCallback(() => {
    setIsAccountModalOpen(true);
  }, [setIsAccountModalOpen]);
  const closeAccountModal = useCallback(() => {
    setIsAccountModalOpen(false);
  }, [setIsAccountModalOpen]);
  const openSongModal = useCallback(() => {
    setIsSongModalOpen(true);
  }, [setIsSongModalOpen]);
  const closeSongModal = useCallback(() => {
    setIsSongModalOpen(false);
  }, [setIsSongModalOpen]);
  return (
    <>
      <AccountModal
        isOpen={isAccountModalOpen}
        closeModal={closeAccountModal}
      />
      <SongModal isOpen={isSongModalOpen} closeModal={closeSongModal} />
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
            <span className="text-sm">Starting Fret Number</span>
            <input
              value={song.startingFretNum}
              onChange={(newValue) => {
                setSongStartingFretNum(
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
              value={song.stringTunings.join(",")}
              onChange={(newValue) => {
                setSongStringTunings(
                  newValue.target.value.split(",").map(sanitizeNoteName)
                );
              }}
              className="bg-neutral-100 w-full px-1 py-1 rounded-md"
            />
          </div>
        </div>
        <div className="centered-row">
          <div className="flex flex-col">
            <span className="text-sm">Chord Names</span>
            <MultiStringInput
              onChange={setChordNames}
              values={song.tabs.map((tab) => tab.chordName)}
            />
          </div>
        </div>
        <div className="centered-col w-[80%]">
          <div className="centered-row justify-between w-full px-1 py-1">
            <div className="centered-row gap-2">
              {song?.title && (
                <>
                  <div>{song.title}</div>
                  <RxPencil1 />
                </>
              )}
            </div>
            <AiOutlineSave
              className="text-gray-300 w-6 h-6 cursor-pointer"
              onClick={openSongModal}
            />
          </div>
          <div
            className="w-full border-2 border-gray-300 border-solid rounded-md gap-8 p-8 grid justify-items-center"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
            }}
          >
            {song.tabs.map((_, i) => (
              <MemoizedTab key={i} tabKey={i} />
            ))}
          </div>
        </div>
      </main>
      <ToastContainer />
    </>
  );
}
