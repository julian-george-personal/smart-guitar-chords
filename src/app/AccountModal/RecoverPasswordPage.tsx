import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import z from "zod";
import { Dispatch, SetStateAction } from "react";
import { AccountModalForms } from "./AccountModal";

type TRecoverPasswordFields = {
  username: string;
  password: string;
};

const validationSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email format"),
});

export default function RecoverPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = (data: TRecoverPasswordFields) => {
    console.log(data);
  };

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
