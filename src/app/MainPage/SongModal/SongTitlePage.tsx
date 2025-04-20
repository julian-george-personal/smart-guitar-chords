import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSongData } from "../../context/song-context";

type TSaveSongFormFields = {
  title: string;
};

interface SaveSongPageProps {
  onFinished: () => void;
}

const validationSchema = z.object({
  title: z.string({ message: "Title is required" }),
});

export default function SaveSongPage({ onFinished }: SaveSongPageProps) {
  const { song } = useSongData();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = async (data: TSaveSongFormFields) => {
    // const response =
    // if (response.isError) {
    //   setError("root", { type: "server", message: response.errorMessage });
    // } else {
    //   onFinished();
    // }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="username" className="block">
          Username
        </label>
        <input
          id="username"
          type="text"
          {...register("title")}
          className="border p-2 w-full"
        />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
        <button type="submit" className="p-2 w-full">
          {song.title ? "Save Changes" : "Save Song"}
        </button>
      </div>
    </form>
  );
}
