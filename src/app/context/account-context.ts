import { createContext, SetStateAction, Dispatch } from "react";

export type TAccount = {
  username: string;
  email: string;
  token: string;
};

export type TAccountContext = {
  account: TAccount | null;
  setAccount: Dispatch<SetStateAction<TAccount | null>>;
};

const defaultAccountContext: TAccountContext = {
  account: null,
  setAccount: () => {},
};

export const AccountContext = createContext<TAccountContext>(
  defaultAccountContext
);
