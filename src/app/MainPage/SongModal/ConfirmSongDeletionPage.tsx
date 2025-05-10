import { useCallback } from "react";
import { toast } from "react-toastify";
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
    toast.success("Succesfully deleted song");
  }, [deleteCurrentSong, onFinished]);
  return (
    <>
      <div>Are you sure you want to delete this song?</div>
      <button
        className="bg-red-500 text-white standard-button"
        onClick={confirmDeletion}
      >
        Confirm Deletion
      </button>
      <button className="standard-button bg-white" onClick={onFinished}>
        Cancel
      </button>
    </>
  );
}
