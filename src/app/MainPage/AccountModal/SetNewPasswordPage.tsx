import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useAccountData } from "../../context/account-context";

type TSetNewPasswordFields = {
  password: string;
};

const validationSchema = z
  .object({
    password: z
      .string({ message: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string({ message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

export default function SetNewPasswordPage() {
  const { setNewPassword } = useAccountData();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = async (data: TSetNewPasswordFields) => {
    const response = await setNewPassword(data.password);
    if (response.isError) {
      setError("root", { type: "server", message: response.errorMessage });
    } else {
      window.location.replace(window.location.href.split("?")[0]);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="password" className="block">
            New Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="border p-2 w-full"
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className="border p-2 w-full"
          />
          {errors.confirmPassword && (
            <p className="text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" className="p-2 w-full">
          Set New Password
        </button>
      </form>
    </>
  );
}
