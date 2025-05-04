import { useCallback } from "react";
import { useSongData } from "../../context/song-context";

interface ConfirmSongDeletionPageProps {
  onFinished: () => void;
}

export default function ConfirmSongDeletionPage({
  onFinished,
}: ConfirmSongDeletionPageProps) {
  const { deleteCurrentSong, selectSong } = useSongData();
  const confirmDeletion = useCallback(async () => {
    await deleteCurrentSong();
    selectSong("");
    onFinished();
  }, [deleteCurrentSong, onFinished]);
  return (
    <>
      <div>Are you sure you want to delete this song?</div>
      <button
        className="bg-red-500 w-full text-white p-1"
        onClick={confirmDeletion}
      >
        Confirm Deletion
      </button>
      <button className="w-full p-1" onClick={onFinished}>
        Cancel
      </button>
    </>
  );
}
