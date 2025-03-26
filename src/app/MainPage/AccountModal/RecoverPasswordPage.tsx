import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useAccountData } from "../../context/account-context";
import { useCallback } from "react";
import { toast } from "react-toastify";

type TRecoverPasswordFields = {
  email: string;
};

interface RecoverPasswordPageProps {
  onFinished: () => void;
}

const validationSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email format"),
});

export default function RecoverPasswordPage({
  onFinished,
}: RecoverPasswordPageProps) {
  const { recoverPassword } = useAccountData();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = useCallback(
    async (data: TRecoverPasswordFields) => {
      const response = await recoverPassword(data.email);
      if (response.isError) {
        setError("root", { type: "server", message: response.errorMessage });
      } else {
        toast.success(
          "Recovery instructions sent to that email if it belongs to a user."
        );
        onFinished();
      }
    },
    [onFinished]
  );

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="border p-2 w-full"
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
        </div>

        <button type="submit" className="p-2 w-full">
          Recover Password
        </button>
      </form>
    </>
  );
}
