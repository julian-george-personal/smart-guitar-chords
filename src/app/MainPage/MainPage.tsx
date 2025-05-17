import { memo, useCallback, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { AiOutlineSave, AiOutlineUser } from "react-icons/ai";
import Tab from "./Tab";
import { useAccountData } from "../context/account-context";
import AccountModal from "./AccountModal/AccountModal";
import { useSongData } from "../context/song-context";
import MultiStringInput from "./MultiStringInput";
import { sanitizeNoteName } from "../logic/music_util";
import SongModal from "./SongModal/SongModal";

const MemoizedTab = memo(Tab);

export default function MainPage() {
  const { account, recoverPasswordToken, songs } = useAccountData();
  const {
    song,
    setChordNames,
    setSongStringTunings,
    setSongStartingFretNum,
    selectSong,
    songId,
  } = useSongData();
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
      <header className="bg-white md:px-6 px-2 py-2 flex flex-row items-center justify-items-stretch">
        <div className="md:flex-1" />
        <div className="flex-1 flex flex-row md:justify-center">
          <div className="md:text-xl sm:text-sm sm:block hidden">
            Smart Guitar Chords
          </div>
        </div>
        <div
          onClick={openAccountModal}
          className="flex-1 flex flex-row justify-end items-center gap-1 cursor-pointer"
        >
          <div className="sm:block hidden">
            {account ? account.username : "Login"}
          </div>
          <AiOutlineUser className="sm:w-4 sm:h-4 w-8 h-8 stroke-4" />
        </div>
      </header>
      <main
        className="font-sans min-h-screen centered-col gap-4 grow px-2"
        id="main"
      >
        <div className="centered-row gap-2 max-w-[80vw] flex-wrap">
          <div className="flex flex-col basis-1/3 min-w-36">
            <span className="text-sm">Starting Fret Number</span>
            <input
              value={song.startingFretNum}
              onChange={(newValue) => {
                const parsedValue = parseInt(newValue.target.value);
                setSongStartingFretNum(
                  parsedValue ? Math.max(0, parsedValue) : 0
                );
              }}
              className="standard-input"
            />
          </div>
          <div className="flex flex-col basis-1/3 min-w-36">
            <span className="text-sm">String Tunings</span>
            <input
              value={song.stringTunings.join(",")}
              onChange={(newValue) => {
                setSongStringTunings(
                  newValue.target.value.split(",").map(sanitizeNoteName)
                );
              }}
              className="standard-input"
            />
          </div>
        </div>
        <div className="centered-row">
          <div className="flex flex-col">
            <span className="text-sm">Chord Names</span>
            <MultiStringInput
              onChange={setChordNames}
              values={song.chordNames}
            />
          </div>
        </div>
        <div className="centered-col w-[80%]">
          <div className="centered-row justify-between w-full py-1">
            <div className="centered-row gap-2">
              {Object.keys(songs).length > 0 && (
                <select
                  className="w-36 standard-input"
                  onChange={(e) => {
                    const songId = e.target.value;
                    selectSong(songId);
                  }}
                  value={songId}
                >
                  <option value={""}>Unsaved Song</option>
                  {Object.entries(songs).map(([songId, song], i) => (
                    <option key={i} value={songId}>
                      {song.title}
                    </option>
                  ))}
                </select>
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
