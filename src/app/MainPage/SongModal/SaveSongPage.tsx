import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSongData } from "../../context/song-context";
import { useCallback } from "react";

type TSaveSongFormFields = {
  title: string;
};

interface SaveSongPageProps {
  onFinished: () => void;
  onDelete: () => void;
}

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
        setError("root", { type: "server", message: response.errorMessage });
      } else {
        onFinished();
      }
    },
    [setTitle, saveSong, selectSong]
  );
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <p className="text-red-500">{errors.title.message}</p>
          )}
          <button type="submit" className="p-2 w-full">
            {songId ? "Save Changes" : "Save Song"}
          </button>
        </div>
      </form>
      {songId && (
        <button className="bg-red-500 w-full text-white p-1" onClick={onDelete}>
          Delete Song
        </button>
      )}
    </>
  );
}
