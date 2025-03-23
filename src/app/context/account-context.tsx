import {
  createContext,
  useState,
  useCallback,
  useContext,
  ReactNode,
} from "react";
import * as accountStore from "../store/account-store";
import { StoreResponse } from "../store/store";

export type TAccount = {
  username: string;
  email: string;
  token: string;
};

export type TAccountContext = {
  account: TAccount | null;
  login: (username: string, password: string) => Promise<StoreResponse>;
  signUp: (
    username: string,
    email: string,
    password: string
  ) => Promise<StoreResponse>;
  recoverPassword: (email: string) => Promise<StoreResponse>;
  loading: boolean;
};

const AccountContext = createContext<TAccountContext | null>(null);

interface AccountProviderProps {
  children: ReactNode;
}

export function AccountProvider({ children }: AccountProviderProps) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  const signUp = useCallback(
    async (
      username: string,
      email: string,
      password: string
    ): Promise<StoreResponse> => {
      setLoading(true);
      const response = await accountStore.signUp(username, email, password);
      setLoading(false);
      return response;
    },
    [setLoading]
  );

  const login = useCallback(async () => {
    return {} as StoreResponse;
  }, []);

  const recoverPassword = useCallback(async () => {
    return {} as StoreResponse;
  }, []);

  return (
    <AccountContext.Provider
      value={{ account, loading, signUp, login, recoverPassword }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export const useAccountData = () => {
  const context = useContext(AccountContext);
  if (context === null) {
    throw new Error();
  }
  return context;
};
