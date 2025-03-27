import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Dispatch, SetStateAction } from "react";
import { AccountModalForms } from "./AccountModal";
import { useAccountData } from "../../context/account-context";

interface LoginPageProps {
  setActiveForm: Dispatch<SetStateAction<AccountModalForms>>;
  onFinished: () => void;
}

type TLoginFormFields = {
  username: string;
  password: string;
};

const validationSchema = z.object({
  username: z.string({ message: "Name is required" }),
  password: z
    .string({ message: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

export default function LoginPage({
  setActiveForm,
  onFinished,
}: LoginPageProps) {
  const { login } = useAccountData();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = async (data: TLoginFormFields) => {
    const response = await login(data.username, data.password);
    if (response.isError) {
      setError("root", { type: "server", message: response.errorMessage });
    } else {
      onFinished();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <p className="text-red-500">{errors.username.message}</p>
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
            <p className="text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button type="submit" className="p-2 w-full">
          Login
        </button>
      </form>
      <button
        onClick={() => setActiveForm(AccountModalForms.SignUp)}
        className="p-2 w-full"
      >
        Sign Up
      </button>
      <button
        onClick={() => setActiveForm(AccountModalForms.RecoverPassword)}
        className="p-2 w-full"
      >
        Forgot Password?
      </button>
    </>
  );
}
