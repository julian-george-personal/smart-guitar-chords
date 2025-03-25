import {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import * as accountStore from "../store/account-store";
import { StoreResponse } from "../store/store";

export type TAccount = {
  username: string;
  email: string;
};

export type TAccountContext = {
  account: TAccount | null;
  login: (username: string, password: string) => Promise<StoreResponse>;
  logout: () => void;
  signUp: (
    username: string,
    email: string,
    password: string
  ) => Promise<StoreResponse>;
  recoverPassword: (email: string, token: string) => Promise<StoreResponse>;
  recoverPasswordToken: string | null;
  setNewPassword: (newPassword: string) => Promise<StoreResponse>;
  loading: boolean;
};

const AccountContext = createContext<TAccountContext | null>(null);

interface AccountProviderProps {
  children: ReactNode;
}

const recoverPasswordToken = new URLSearchParams(window.location.search).get(
  "recoverPasswordToken"
);

export function AccountProvider({ children }: AccountProviderProps) {
  const [account, setAccount] = useState<TAccount | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    accountStore.getUser().then((response) => {
      if (!response.isError) {
        const getUserResponse = response as accountStore.GetUserResponse;
        setAccount({
          username: getUserResponse.username,
          email: getUserResponse.email,
        });
      }
    });
  }, []);

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

  const login = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      const response = await accountStore.login(username, password);
      setLoading(false);
      if (!response.isError) {
        const loginResponse = response as accountStore.LoginResponse;
        setAccount({
          username: loginResponse.username,
          email: loginResponse.email,
        });
      }
      return response;
    },
    [setLoading, setAccount]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    await accountStore.logout();
    setLoading(false);
    setAccount(null);
  }, [setAccount]);

  const recoverPassword = useCallback(async (email: string) => {
    return await accountStore.recoverPassword(email);
  }, []);

  const setNewPassword = useCallback(async (newPassword: string) => {
    if (!recoverPasswordToken) throw new Error();
    return await accountStore.setNewPassword(newPassword, recoverPasswordToken);
  }, []);

  return (
    <AccountContext.Provider
      value={{
        account,
        loading,
        signUp,
        login,
        logout,
        recoverPassword,
        recoverPasswordToken,
        setNewPassword,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export const useAccountData = () => {
  const context = useContext(AccountContext);
  if (context === null) {
    throw new Error("AccountContext is null");
  }
  return context;
};
