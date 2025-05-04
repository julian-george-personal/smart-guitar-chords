import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "react-toastify";
import { useAccountData } from "../../context/account-context";
import { useCallback } from "react";

type TSignUpFormFields = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const validationSchema = z
  .object({
    username: z.string({ message: "Name is required" }),
    email: z
      .string({ message: "Email is required" })
      .email("Invalid email format"),
    password: z
      .string({ message: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string({ message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

interface SignUpPageProps {
  onFinished: () => void;
}

export default function SignUpPage({ onFinished }: SignUpPageProps) {
  const { signUp } = useAccountData();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = useCallback(async (data: TSignUpFormFields) => {
    const response = await signUp(data.username, data.email, data.password);
    if (response.isError) {
      setError("root", { type: "server", message: response.errorMessage });
    } else {
      toast.success("Successfully created account. Log in to use it.");
      onFinished();
    }
  }, []);

  return (
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
        <label htmlFor="email" className="block">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="border p-2 w-full"
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
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

      <div>
        <label htmlFor="confirmPassword" className="block">
          Confirm Password
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
        Sign Up
      </button>
    </form>
  );
}
