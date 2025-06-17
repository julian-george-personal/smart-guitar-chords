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
import Select from "react-select";
import InfoModal from "./InfoModal";

const MemoizedTab = memo(Tab);

export default function MainPage() {
  const { account, recoverPasswordToken, songs } = useAccountData();
  const {
    song,
    setChordNames,
    setSongStringTunings,
    setSongCapoFretNum,
    setSongFretCount,
    selectSong,
    songId,
  } = useSongData();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isSongModalOpen, setIsSongModalOpen] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
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
  const openInfoModal = useCallback(() => {
    setIsInfoModalOpen(true);
  }, [setIsInfoModalOpen]);
  const closeInfoModal = useCallback(() => {
    setIsInfoModalOpen(false);
  }, [setIsInfoModalOpen]);
  return (
    <>
      <AccountModal
        isOpen={isAccountModalOpen}
        closeModal={closeAccountModal}
      />
      <SongModal isOpen={isSongModalOpen} closeModal={closeSongModal} />
      <InfoModal isOpen={isInfoModalOpen} closeModal={closeInfoModal} />
      <header className="bg-[#fffefc] md:px-4 px-2 pt-2 flex flex-row items-center justify-items-stretch min-h-[5vh]">
        <div className="md:flex-1 flex flex-row items-center gap-1" >
          <img src="/logo.png" className="h-8 w-8" />
          <div className="font-[Inter] font-bold text-xl tracking-tighter">Smart Guitar Chords</div>
        </div>
        <div
          onClick={openAccountModal}
          className="flex-1 flex flex-row justify-end items-center gap-1 cursor-pointer"
        >
          <div className="font-medium">
            {account ? account.username : "Login"}
          </div>
          <AiOutlineUser className="w-6 h-6 stroke-6" />
        </div>
      </header>
      <main
        className="font-sans min-h-[92vh] flex flex-col items-center gap-4 grow px-2 md:pt-20 pt-12 box-border bg-[#fffefc]"
        id="main"
      >
        <div className="centered-col gap-2">
          <div className="centered-row gap-2 max-w-[66vw] flex-wrap">
            <div className="flex flex-col min-w-16">
              <span className="text-[12px]">String Tunings</span>
              <input
                value={song.stringTunings.join(",")}
                onChange={(newValue) => {
                  setSongStringTunings(
                    newValue.target.value.split(",").map(sanitizeNoteName)
                  );
                }}
                className="standard-input w-36"
              />
            </div>
            <div className="flex flex-col min-w-16">
              <span className="text-[12px]">Capo Fret</span>
              <input
                value={song.capoFretNum}
                onChange={(newValue) => {
                  let parsedValue = parseInt(newValue.target.value);
                  if (isNaN(parsedValue)) parsedValue = 0;
                  if (parsedValue >= 0) setSongCapoFretNum(parsedValue);
                }}
                className="standard-input w-36"
              />
            </div>
            <div className="flex flex-col min-w-16">
              <span className="text-[12px]">Fret Window Size</span>
              <input
                value={song.fretCount}
                onChange={(newValue) => {
                  let parsedValue = parseInt(newValue.target.value);
                  if (isNaN(parsedValue)) parsedValue = 0;
                  if (parsedValue <= 12 && parsedValue >= 0)
                    setSongFretCount(parsedValue);
                }}
                className="standard-input w-36"
              />
            </div>
          </div>
          <div className="centered-row">
            <div className="flex flex-col max-w-[66vw]">
              <span className="text-[12px]">Chord Names</span>
              <MultiStringInput
                onChange={setChordNames}
                values={song.chordNames}
              />
            </div>
          </div>
        </div>
        <div className="centered-col w-[80%] pb-32">
          <div className="centered-row justify-between w-full pb-1">
            <div className="centered-row gap-2">
              {Object.keys(songs).length > 0 && (
                <Select
                  className="w-36 p-0"
                  classNamePrefix="select"
                  value={{ value: songId, label: songId ? songs[songId]?.title : "New Song" }}
                  onChange={(option) => {
                    selectSong(option?.value ?? "");
                  }}
                  options={[
                    { value: "", label: "New Song" },
                    ...Object.entries(songs).map(([id, song]) => ({
                      value: id,
                      label: song.title
                    }))
                  ]}
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      border: 'none',
                      boxShadow: 'none',
                      minHeight: '30px',
                      '&:hover': {
                        border: 'none'
                      }
                    }),
                    option: (baseStyles, state) => ({
                      ...baseStyles,
                      backgroundColor: state.isSelected ? '#e5e7eb' : state.isFocused ? '#f3f4f6' : 'white',
                      color: state.data.value === "" ? '#6B7280' : '#000000',
                      '&:active': {
                        backgroundColor: '#e5e7eb'
                      }
                    }),
                    singleValue: (baseStyles, { data }) => ({
                      ...baseStyles,
                      color: data.value === "" ? '#6B7280' : '#000000'
                    }),
                    valueContainer: (baseStyles) => ({
                      ...baseStyles,
                      padding: '0px 0px',
                      zIndex: 50
                    }),
                    indicatorSeparator: () => ({
                      display: 'none'
                    }),
                    dropdownIndicator: (baseStyles) => ({
                      ...baseStyles,
                      color: '#6B7280'
                    }),
                    menu: (baseStyles) => ({
                      ...baseStyles,
                      border: 'none',
                      zIndex: 50
                    })
                  }}
                />
              )}
            </div>
            <AiOutlineSave
              className="text-gray-500 w-6 h-6 cursor-pointer"
              onClick={openSongModal}
            />
          </div>
          <div
            className="w-full border-2 border-gray-300 border-solid rounded-md gap-8 px-8 py-4 grid justify-items-center"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
            }}
          >
            {song.tabs.map((_, i) => (
              <MemoizedTab key={i} tabKey={i} />
            ))}
          </div>
        </div>
      </main>
      <footer className="text-xs text-gray-500 px-2 gap-2 text-sm flex flex-row items-center h-[3vh] bg-[#fffefc]">
        <div>
          © Julian George 2025
        </div>
        <div>
          |
        </div>
        <div onClick={openInfoModal} className="cursor-pointer">
          Bugs? Suggestions?
        </div>
      </footer>
      <ToastContainer />
    </>
  );
}
