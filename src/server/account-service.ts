import { z } from "zod";
import Bun from "bun";
import {
  getAccountByUsername,
  putNewAccount as putNewAccount,
  setAccountNewPassword,
} from "./dynamo-client";
import {
  TCreateAccountRequest,
  TLoginRequest,
  TLoginResponse,
  TSetNewPasswordRequest,
} from "./requests";
import { generateToken, verifyToken } from "./auth-client";

export enum AccountStatus {
  Success,
  InvalidRequest,
  InvalidToken,
  UnknownError,
}

export enum AccountErrors {
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
    .string({ message: AccountErrors.UsernameInvalidFormat })
    .min(4, AccountErrors.UsernameTooShort)
    .max(256, AccountErrors.UsernameTooLong),
  email: z
    .string({ message: AccountErrors.EmailInvalidFormat })
    .email(AccountErrors.EmailInvalidFormat)
    .min(4, AccountErrors.EmailTooShort)
    .max(256, AccountErrors.EmailTooLong),
  password: z
    .string({ message: AccountErrors.PasswordInvalidFormat })
    .min(5, AccountErrors.PasswordTooShort)
    .max(256, AccountErrors.PasswordTooLong),
});

export async function signup(
  request: TCreateAccountRequest
): Promise<[AccountStatus, AccountErrors | null]> {
  const { success, error } = accountSchema.safeParse(request);
  if (!success) {
    if (!error) {
      throw new Error();
    }
    return [
      AccountStatus.InvalidRequest,
      error.errors[0].message as AccountErrors,
    ];
  }

  const { username, email, password } = request;

  const hashedPassword = await Bun.password.hash(password);

  await putNewAccount(username, hashedPassword, email);

  return [AccountStatus.Success, null];
}

async function getExistingUsers(username: string, email: string) {
  const userByUsername = await getAccountByUsername(username);
}

export async function login(
  request: TLoginRequest
): Promise<[TLoginResponse | null, AccountStatus]> {
  const { username, password } = request;
  const user = await getAccountByUsername(username);
  if (!user) return [null, AccountStatus.InvalidRequest];
  const isMatch = await Bun.password.verify(password, user.hashedPassword);
  if (!isMatch) return [null, AccountStatus.InvalidRequest];
  const token = generateToken(user.username);
  return [
    { username: user.username, email: user.email, token },
    AccountStatus.Success,
  ];
}

export async function setNewPassword(
  request: TSetNewPasswordRequest
): Promise<[AccountStatus]> {
  const { success, error } = accountSchema
    .pick({ password: true })
    .safeParse(request);
  if (!success) return [AccountStatus.InvalidRequest];
  const parsedToken = verifyToken<{ email: string }>(request.token);
  if (!parsedToken) return [AccountStatus.InvalidToken];
  const hashedPassword = await Bun.password.hash(request.newPassword);
  await setAccountNewPassword(parsedToken.email, hashedPassword);
  return [AccountStatus.Success];
}
