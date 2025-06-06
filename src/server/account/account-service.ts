import { z } from "zod";
import {
  getAccountByEmail,
  getAccountByUsername,
  putNewAccount,
  setAccountNewPassword,
} from "./account-repository";
import {
  TCreateAccountRequest,
  TGetAccountResponse,
  TLoginRequest,
  TLoginResponse,
  TRecoverPasswordRequest,
  TSetNewPasswordRequest,
} from "./account-requests";
import { generateToken, hashPassword, verifyToken } from "../clients/auth-client";
import { sendRecoverPasswordEmail } from "../clients/email-client";

export enum AccountStatus {
  Success,
  InvalidRequest,
  NotFound,
  Unauthorized,
  UnknownError,
  Conflict,
}

export enum AccountErrors {
  UsernameInvalidFormat = "UsernameInvalidFormat",
  UsernameTooShort = "UsernameTooShort",
  UsernameTooLong = "UsernameTooLong",
  UsernameTaken = "UsernameTaken",
  EmailInvalidFormat = "EmailInvalidFormat",
  EmailTooShort = "EmailTooShort",
  EmailTooLong = "EmailTooLong",
  EmailTaken = "EmailTaken",
  PasswordInvalidFormat = "PasswordInvalidFormat",
  PasswordTooShort = "PasswordTooShort",
  PasswordTooLong = "PasswordTooLong",
  InvalidToken = "InvalidToken",
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

  if (await getAccountByUsername(username)) {
    return [AccountStatus.Conflict, AccountErrors.UsernameTaken];
  }

  if (await getAccountByEmail(email)) {
    return [AccountStatus.Conflict, AccountErrors.EmailTaken];
  }

  const hashedPassword = await hashPassword(password)

  await putNewAccount(username, hashedPassword, email);

  return [AccountStatus.Success, null];
}

export async function getAccount(
  username: string | null
): Promise<[TGetAccountResponse | null, AccountStatus]> {
  if (username == null) {
    return [null, AccountStatus.InvalidRequest];
  }
  const accountInfo = await getAccountByUsername(username);
  if (!accountInfo) {
    return [null, AccountStatus.NotFound];
  }
  return [
    { username: accountInfo.username, email: accountInfo.email },
    AccountStatus.Success,
  ];
}

export async function login(
  request: TLoginRequest
): Promise<[TLoginResponse | null, AccountStatus]> {
  const { username, password } = request;
  const user = await getAccountByUsername(username);
  if (!user) return [null, AccountStatus.NotFound];
  const isMatch = await Bun.password.verify(password, user.hashedPassword);
  if (!isMatch) return [null, AccountStatus.InvalidRequest];
  const token = generateToken({ username: user.username });
  return [
    { username: user.username, email: user.email, token },
    AccountStatus.Success,
  ];
}

export async function recoverPassword(
  request: TRecoverPasswordRequest
): Promise<[AccountStatus, AccountErrors | null]> {
  const { success, error } = accountSchema
    .pick({ email: true })
    .safeParse(request);
  if (!success)
    return [
      AccountStatus.InvalidRequest,
      error.errors[0].message as AccountErrors,
    ];
  const account = await getAccountByEmail(request.email);
  if (account != null) {
    const token = generateToken({
      username: account.username,
      email: request.email,
    });
    await sendRecoverPasswordEmail(request.email, token);
  }
  return [AccountStatus.Success, null];
}

export async function setNewPassword(
  request: TSetNewPasswordRequest
): Promise<[AccountStatus, AccountErrors | null]> {
  const parsedToken = verifyToken<{ email: string; username: string }>(
    request.token
  );
  if (!parsedToken)
    return [AccountStatus.Unauthorized, AccountErrors.InvalidToken];
  const { success, error } = accountSchema
    .pick({ password: true })
    .safeParse({ password: request.newPassword });
  if (!success)
    return [
      AccountStatus.InvalidRequest,
      error.errors[0].message as AccountErrors,
    ];
  const hashedPassword = await hashPassword(request.newPassword);
  await setAccountNewPassword(parsedToken.email, hashedPassword);
  return [AccountStatus.Success, null];
}
