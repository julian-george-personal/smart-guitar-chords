import { memo, useCallback, useEffect, useState, useLayoutEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { AiOutlineEdit, AiOutlineSave, AiOutlineUser, AiOutlineUndo } from "react-icons/ai";
import Tab from "./Tab";
import AccountModal from "./AccountModal/AccountModal";
import MultiStringInput from "./MultiStringInput";
import { sanitizeNoteNameForDisplay, sanitizeNoteNameForLogic } from "../logic/music_util";
import SongModal from "./SongModal/SongModal";
import Select from "react-select";
import InfoModal from "./InfoModal";
import AdaptiveInput from "./AdaptiveInput";
import { useAccountData } from "../state/account/account-hooks";
import { useSongData } from "../state/song/song-hooks";

const MemoizedTab = memo(Tab);

export default function MainPage() {
  const { account, recoverPasswordToken, songs, orderedUsedStringTunings } =
    useAccountData();
  const {
    song,
    updateChords,
    setSongStringTunings,
    setSongCapoFretNum,
    setSongFretCount,
    selectSong,
    songId,
    isCurrentSongUnsaved,
    saveSong,
    unsavedSongIds,
    undoUnsavedChanges
  } = useSongData();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isSongModalOpen, setIsSongModalOpen] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [stringifiedStringTunings, setStringifiedStringTunings] =
    useState<string>("");
  const [stringTuningsAutocompleteSuffix, setStringTuningsAutocompleteSuffix] =
    useState<string>("");
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

  const onSave = useCallback(
    async () => {
      const response = await saveSong({});
      if (response.isError) {
        toast.error("Failed to save song, please try again.")
      } else if (songId) {
        toast.success("Song saved");
      } else {
        toast.success("New song saved");
      }
    },
    [saveSong, songId]
  );

  useLayoutEffect(() => {
    if (!stringifiedStringTunings || stringifiedStringTunings == "") {
      setStringTuningsAutocompleteSuffix("");
      return;
    }
    const autocompleteMatch: string | undefined =
      orderedUsedStringTunings.filter(
        (tuning) => tuning.indexOf(stringifiedStringTunings) == 0
      )?.[0];
    const autocompleteSuffix = autocompleteMatch
      ? autocompleteMatch.replace(stringifiedStringTunings, "")
      : "";
    setStringTuningsAutocompleteSuffix(autocompleteSuffix);
  }, [stringifiedStringTunings, setStringTuningsAutocompleteSuffix, orderedUsedStringTunings]);

  useEffect(() => {
    if (!song) return;
    setStringifiedStringTunings(song.stringTunings.map(sanitizeNoteNameForDisplay).join(","));
  }, [song, setStringifiedStringTunings]);

  useEffect(() => {
    if (stringifiedStringTunings)
      setSongStringTunings(stringifiedStringTunings.split(",").map(note => `${note}1`));
  }, [stringifiedStringTunings, setSongStringTunings]);

  const autocompleteStringTunings = useCallback(() => {
    setStringifiedStringTunings(
      stringifiedStringTunings + stringTuningsAutocompleteSuffix
    );
  }, [
    setStringifiedStringTunings,
    stringifiedStringTunings,
    stringTuningsAutocompleteSuffix,
  ]);

  const handleChordsChange = useCallback((newValues: Record<string, { index: number; value: string }>) => {
    const updatedChords = Object.entries(newValues).map(([id, data]) => ({
      id,
      chordName: data.value,
      index: data.index,
    }));
    updateChords(updatedChords);
  }, [updateChords]);

  return (
    <>
      <AccountModal
        isOpen={isAccountModalOpen}
        closeModal={closeAccountModal}
      />
      <SongModal isOpen={isSongModalOpen} closeModal={closeSongModal} />
      <InfoModal isOpen={isInfoModalOpen} closeModal={closeInfoModal} />
      <header className="bg-[#fffefc] md:px-4 px-2 pt-2 flex flex-row items-center justify-items-stretch min-h-[5vh]">
        <div className="md:flex-1 flex flex-row items-center gap-1">
          <img src="/logo.png" className="h-8 w-8" />
          <div className="font-[Inter] font-bold text-xl tracking-tighter">
            Smart Guitar Chords
          </div>
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
              <div className="standard-input w-36 centered-row justify-start">
                <AdaptiveInput
                  value={stringifiedStringTunings}
                  onChange={(newValue) => {
                    // We split and rejoin so we can sanitize the notes
                    setStringifiedStringTunings(
                      newValue.target.value
                        .split(",")
                        .map(sanitizeNoteNameForLogic)
                        .join(",")
                    );
                  }}
                  onKeyDown={(e) => {
                    const autocompleteKeys = new Set<string>([
                      "Enter",
                      "Tab",
                      "Go",
                      "Done",
                    ]);
                    if (autocompleteKeys.has(e.key)) {
                      if (stringTuningsAutocompleteSuffix) {
                        autocompleteStringTunings();
                        e.preventDefault();
                      }
                    }
                  }}
                  className="bg-transparent p-0"
                  style={
                    stringTuningsAutocompleteSuffix == ""
                      ? { width: "100%" }
                      : {}
                  }
                />
                <span
                  className="text-gray-500 cursor-pointer"
                  onClick={(e) => {
                    autocompleteStringTunings();
                    e.preventDefault();
                  }}
                >
                  {stringTuningsAutocompleteSuffix}
                </span>
              </div>
            </div>
            <div className="flex flex-col min-w-16">
              <span className="text-[12px]">Capo Fret</span>
              <input
                value={song?.capoFretNum ?? 0}
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
                value={song?.fretCount ?? 0}
                onChange={(newValue) => {
                  let parsedValue = parseInt(newValue.target.value);
                  if (isNaN(parsedValue)) parsedValue = 0;
                  if (parsedValue <= 12 && parsedValue >= 0)
                    setSongFretCount(parsedValue);
                }}
                type="number"
                className="standard-input w-36"
              />
            </div>
          </div>
          <div className="centered-row">
            <div className="flex flex-col max-w-[66vw]">
              <span className="text-[12px]">Chord Names</span>
              <MultiStringInput
                onChange={handleChordsChange}
                values={song?.chords.reduce((acc, chord) => { acc[chord.id] = { index: chord.index, value: chord.chordName }; return acc; }, {} as Record<string, { index: number; value: string }>) || {}}
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
                  value={{
                    value: songId,
                    label: songId ? songs[songId]?.title : "New Song",
                  }}
                  onChange={(option) => {
                    selectSong(option?.value ?? "");
                  }}
                  options={[
                    { value: "", label: "New Song" },
                    ...Object.entries(songs).map(([id, song]) => ({
                      value: id,
                      label: song.title,
                    })),
                  ]}
                  styles={{
                    control: (baseStyles, _state) => ({
                      ...baseStyles,
                      border: "none",
                      boxShadow: "none",
                      minHeight: "30px",
                      "&:hover": {
                        border: "none",
                      },
                    }),
                    option: (baseStyles, state) => ({
                      ...baseStyles,
                      backgroundColor: state.isSelected
                        ? "#e5e7eb"
                        : state.isFocused
                          ? "#f3f4f6"
                          : "white",
                      fontWeight: unsavedSongIds.has(state.data.value ?? "") ? "bold" : "normal",
                      color: state.data.value === "" ? "#6B7280" : "#000000",
                      "&:active": {
                        backgroundColor: "#e5e7eb",
                      },
                    }),
                    singleValue: (baseStyles, { data }) => ({
                      ...baseStyles,
                      color: data.value === "" ? "#6B7280" : "#000000",
                      fontWeight: unsavedSongIds.has(data.value ?? "") ? "bold" : "normal",
                    }),
                    valueContainer: (baseStyles) => ({
                      ...baseStyles,
                      padding: "0px 0px",
                      zIndex: 50,
                    }),
                    indicatorSeparator: () => ({
                      display: "none",
                    }),
                    dropdownIndicator: (baseStyles) => ({
                      ...baseStyles,
                      color: "#6B7280",
                    }),
                    menu: (baseStyles) => ({
                      ...baseStyles,
                      border: "none",
                      zIndex: 50,
                    }),
                  }}
                />
              )}
            </div>
            <div className="centered-row gap-2">
              {
                songId &&
                isCurrentSongUnsaved &&
                <AiOutlineUndo
                  className="cursor-pointer w-6 h-6 text-black"
                  onClick={undoUnsavedChanges}
                  title="Undo Unsaved Changes" />
              }
              <AiOutlineSave
                className={`${isCurrentSongUnsaved || !songId ? 'text-black' : 'text-gray-500'} w-6 h-6 cursor-pointer`}
                onClick={songId ? onSave : openSongModal}
                title="Save Changes"
              />
              {songId && <AiOutlineEdit
                className="text-black w-6 h-6 cursor-pointer"
                onClick={openSongModal}
                title="Edit Details"
              />}
            </div>
          </div>
          <div
            className="w-full border-2 border-gray-300 border-solid rounded-md gap-8 px-8 py-4 grid justify-items-center"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
            }}
          >
            {song?.chords?.map((_, i) => (
              <MemoizedTab key={i} tabKey={i} />
            ))}
          </div>
        </div>
      </main>
      <footer className="text-xs text-gray-500 px-2 gap-2 text-sm flex flex-row items-center h-[3vh] bg-[#fffefc]">
        <div>
          ©{" "}
          <a href="https://juliangeorge.net" className="underline">
            Julian George 2025
          </a>
        </div>
        <div>|</div>
        <div onClick={openInfoModal} className="cursor-pointer font-medium">
          Bugs? Suggestions?
        </div>
      </footer>
      <ToastContainer />
    </>);
}
