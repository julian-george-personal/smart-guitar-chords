import { z } from "zod";
import Bun from "bun";
import { putNewUser } from "./dynamo-client";
import { TCreateAccountRequest } from "./requests";

export enum CreateAccountStatus {
  Success,
  InvalidRequest,
  UnknownError,
}

export enum CreateAccountErrors {
  UsernameInvalidFormat = "UsernameInvalidFormat",
  UsernameTooShort = "UsernameTooShort",
  UsernameTooLong = "UsernameTooLong",
  EmailInvalidFormat = "EmailInvalidFormat",
  EmailTooShort = "EmailTooShort",
  EmailTooLong = "EmailTooLong",
  PasswordInvalidFormat = "PasswordInvalidFormat",
  PasswordTooShort = "PasswordTooShort",
  PasswordTooLong = "PasswordTooLong",
}

const accountSchema = z.object({
  username: z
    .string({ message: CreateAccountErrors.UsernameInvalidFormat })
    .min(4, CreateAccountErrors.UsernameTooShort)
    .max(256, CreateAccountErrors.UsernameTooLong),
  email: z
    .string({ message: CreateAccountErrors.EmailInvalidFormat })
    .email(CreateAccountErrors.EmailInvalidFormat)
    .min(4, CreateAccountErrors.EmailTooShort)
    .max(256, CreateAccountErrors.EmailTooLong),
  password: z
    .string({ message: CreateAccountErrors.PasswordInvalidFormat })
    .min(4, CreateAccountErrors.PasswordTooShort)
    .max(256, CreateAccountErrors.PasswordTooLong),
});

export async function createAccount(
  request: TCreateAccountRequest
): Promise<[CreateAccountStatus, CreateAccountErrors | null]> {
  const { success, error } = accountSchema.safeParse(request);

  if (!success) {
    if (!error) {
      throw new Error();
    }

    return [
      CreateAccountStatus.InvalidRequest,
      error.errors[0].message as CreateAccountErrors,
    ];
  }

  const { username, email, password } = request;

  const hashedPassword = await Bun.password.hash(password);

  await putNewUser(username, hashedPassword, email);

  return [CreateAccountStatus.Success, null];
}
