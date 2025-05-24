import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useCallback } from "react";
import { useSongData } from "../../context/song-context";
import { UnknownServerErrorMessage } from "../constants";
import { StoreResponse } from "../../store/store";

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
  const { song, songId, setTitle, saveSong, selectSong } = useSongData();
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

  const onSubmit = useCallback(
    async (data: TSaveSongFormFields) => {
      const response = await saveSong({ title: data.title });
      if (response.isError) {
        setError("root", {
          type: "server",
          message: GetErrorStatusMessage(response),
        });
      } else {
        if (!songId) toast.success("New song saved");
        onFinished();
      }
    },
    [setTitle, saveSong, selectSong]
  );

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
              {songId ? "Save Changes" : "Save Song"}
            </button>
          </div>
        </div>
      </form>
      {songId && (
        <button
          className="bg-red-500 text-white standard-button"
          onClick={onDelete}
        >
          Delete Song
        </button>
      )}
    </>
  );
}
