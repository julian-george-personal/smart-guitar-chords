import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useCallback } from "react";
import { PulseLoader, SyncLoader } from "react-spinners";
import { useAccountData } from "../../context/account-context";
import { UnknownServerErrorMessage } from "../constants";

type TLoginFormFields = {
  username: string;
  password: string;
};

const validationSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const ErrorStatusMessages: { [errorCode: number]: string } = {
  404: "Invalid credentials",
  500: UnknownServerErrorMessage,
};

interface LoginPageProps {
  onSignUp: () => void;
  onForgotPassword: () => void;
  onFinished: () => void;
}

export default function LoginPage({
  onSignUp,
  onForgotPassword,
  onFinished,
}: LoginPageProps) {
  const { login, isLoading } = useAccountData();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = useCallback(async (data: TLoginFormFields) => {
    const response = await login(data.username, data.password);
    if (response.isError) {
      setError("root", {
        type: "server",
        message: response.errorCode
          ? ErrorStatusMessages[response.errorCode]
          : UnknownServerErrorMessage,
      });
    } else {
      onFinished();
    }
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {errors.root && (
          <p className="text-red-500 text-sm">{errors.root.message}</p>
        )}
        <div className="flex flex-col gap-2">
          <div>
            <label htmlFor="username" className="block">
              Username
            </label>
            <input
              id="username"
              type="text"
              {...register("username")}
              className="border p-2 w-full"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block">
              Password
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
        </div>

        <button type="submit" className="standard-button">
          {isLoading ? <PulseLoader size={12} cssOverride={{ margin: 0 }} speedMultiplier={0.5} /> : "Login"}
        </button>
      </form>
      <button onClick={onSignUp} className="standard-button">
        Sign Up
      </button>
      <button onClick={onForgotPassword} className="standard-button bg-white">
        Forgot Password?
      </button>
    </>
  );
}
