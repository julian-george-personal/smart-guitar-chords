import { useCallback } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { StoreResponse } from "../../state/store";
import { UnknownServerErrorMessage } from "../constants";
import { PulseLoader } from "react-spinners";
import { useSongData } from "../../state/song/song-hooks";

const GetErrorStatusMessage = (response: StoreResponse) => {
  if (response.errorCode === 400) {
    return "Invalid request: " + response.errorMessage;
  }
  if (response.errorCode === 401) {
    return "Your user session is invalid or expired: please log in again and try again";
  }
  return UnknownServerErrorMessage;
};

interface ConfirmSongDeletionPageProps {
  onFinished: () => void;
}

export default function ConfirmSongDeletionPage({
  onFinished,
}: ConfirmSongDeletionPageProps) {
  const { deleteCurrentSong, selectSong, isLoading } = useSongData();
  const {
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const onSubmit = useCallback(async () => {
    const response = await deleteCurrentSong();
    if (response.isError) {
      setError("root", {
        type: "server",
        message: GetErrorStatusMessage(response),
      });
    } else {
      selectSong("");
      onFinished();
      toast.success("Succesfully deleted song");
    }
  }, [deleteCurrentSong, onFinished, selectSong, setError]);
  return (
    <>
      {errors.root && (
        <p className="text-red-500 text-sm">{errors.root.message}</p>
      )}
      <div>Are you sure you want to delete this song?</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <button
          className="bg-red-500 text-white standard-button"
          type="submit"
        >
          {isLoading ? <PulseLoader size={12} cssOverride={{ margin: 0 }} speedMultiplier={0.5} color="white" /> : "Confirm Deletion"}
        </button>
      </form>
      <button className="standard-button bg-white" onClick={onFinished}>
        Cancel
      </button>
    </>
  );
}
