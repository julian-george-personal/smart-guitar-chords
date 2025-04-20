import {
  getAccountInfo,
  putAccountInfo,
  updateAccountInfo,
} from "./accountinfo-store";
import { getEmailUsername, putEmailUsername } from "./emailusername-store";

export async function putNewAccount(
  username: string,
  hashedPassword: string,
  email: string
) {
  await putAccountInfo(username, { username, hashedPassword, email });
  await putEmailUsername(email, { username });
}

export async function getAccountByUsername(username: string) {
  return (await getAccountInfo(username)) ?? null;
}

export async function getAccountByEmail(email: string) {
  const emailUsername = await getEmailUsername(email);
  if (!emailUsername) return null;
  return getAccountInfo(emailUsername.username);
}

export async function setAccountNewPassword(
  email: string,
  hashedPassword: string
) {
  const account = await getAccountByEmail(email);

  if (!account) {
    throw new Error("User not found");
  }
  await updateAccountInfo(account.username, { hashedPassword });
}
