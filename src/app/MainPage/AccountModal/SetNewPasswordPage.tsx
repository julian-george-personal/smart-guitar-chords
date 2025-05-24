import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "react-toastify";
import { useAccountData } from "../../context/account-context";
import { useCallback } from "react";
import { UnknownServerErrorMessage } from "../constants";
import { StoreResponse } from "../../store/store";

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

  const GetErrorStatusMessage = (response: StoreResponse) => {
    if (response.errorCode === 400) {
      return "Invalid password: " + response.errorMessage;
    }
    if (response.errorCode === 401) {
      return "This password reset link is invalid or expired";
    }
    return UnknownServerErrorMessage;
  };

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

  const onSubmit = useCallback(async (data: TSetNewPasswordFields) => {
    const response = await setNewPassword(data.password);
    if (response.isError) {
      setError("root", {
        type: "server",
        message: response.errorCode
          ? GetErrorStatusMessage(response)
          : UnknownServerErrorMessage,
      });
    } else {
      toast.success("Successfully set new password");
      setTimeout(() => {
        window.location.replace(window.location.href.split("?")[0]);
      }, 2500);
    }
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <p className="text-red-500 text-sm">{errors.root.message}</p>
        )}
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
            <p className="text-red-500 text-sm">{errors.password.message}</p>
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
            <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" className="p-2 w-full">
          Set New Password
        </button>
      </form>
    </>
  );
}
