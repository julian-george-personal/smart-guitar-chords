import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useCallback } from "react";
import { useSongData } from "../../context/song-context";
import { UnknownServerErrorMessage } from "../constants";
import { StoreResponse } from "../../store/store";
import { PulseLoader } from "react-spinners";

type TSaveSongFormFields = {
  title: string;
};

interface SaveSongPageProps {
  onFinished: () => void;
  onDelete: () => void;
}

const GetErrorStatusMessage = (response: StoreResponse) => {
  if (response.errorCode === 400) {
    return "Invalid song data: " + response.errorMessage;
  }
  if (response.errorCode === 401) {
    return "Your user session is invalid or expired: please log in again and try again";
  }
  return UnknownServerErrorMessage;
};

const validationSchema = z.object({
  title: z.string({ message: "Title is required" }),
});

export default function SaveSongPage({
  onFinished,
  onDelete,
}: SaveSongPageProps) {
  const { song, songId, setTitle, saveSong, selectSong, duplicateCurrentSong, isLoading } = useSongData();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      title: song.title ?? "",
    },
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = useCallback((data: TSaveSongFormFields) => onSave(data, true), [])

  const onSave = useCallback(
    async (data: TSaveSongFormFields, shouldFinish: boolean) => {
      const response = await saveSong({ title: data.title });
      if (response.isError) {
        setError("root", {
          type: "server",
          message: GetErrorStatusMessage(response),
        });
      } else {
        !!songId ? toast.success("Song saved") : toast.success("New song saved");
        if (shouldFinish) onFinished();
      }
    },
    [setTitle, saveSong, selectSong]
  );

  const onDuplicate = useCallback(async (data: TSaveSongFormFields) => {
    onSave(data, false);
    const response = await duplicateCurrentSong();
    if (response.isError) {
      toast.error(GetErrorStatusMessage(response));
    } else {
      toast.success("Song duplicated successfully");
      onFinished();
    }
  }, [duplicateCurrentSong, onFinished, onSave]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {errors.root && (
          <p className="text-red-500 text-sm">{errors.root.message}</p>
        )}
        <div className="flex flex-col gap-2">
          <div>
            <label htmlFor="title" className="block">
              Title
            </label>
            <input
              id="title"
              type="text"
              {...register("title")}
              className="border p-2 w-full"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
            <button type="submit" className="standard-button">
              {isLoading ? <PulseLoader size={12} cssOverride={{ margin: 0 }} speedMultiplier={0.5} /> : songId ? "Save Changes" : "Save Song"}
            </button>
          </div>
        </div>
      </form>
      {songId && (
        <div>
          <button
            className="standard-button"
            onClick={handleSubmit(onDuplicate)}
            disabled={isLoading}
          >
            {isLoading ? (
              <PulseLoader size={12} cssOverride={{ margin: 0 }} speedMultiplier={0.5} />
            ) : (
              "Duplicate Song"
            )}
          </button>
          <button
            className="bg-red-500 text-white standard-button"
            onClick={onDelete}
          >
            Delete Song
          </button>
        </div>
      )}
    </>
  );
}
