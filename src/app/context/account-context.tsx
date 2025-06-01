import {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import * as accountStore from "../store/account-store";
import * as songStore from "../store/song-store";
import { StoreResponse } from "../store/store";
import { TSong } from "./song-context";
import { withLoading } from "../util";

export type TAccount = {
  username: string;
  email: string;
};

export type TAccountContext = {
  account: TAccount | null;
  songs: {
    [songId: string]: TSong;
  };
  login: (username: string, password: string) => Promise<StoreResponse>;
  logout: () => void;
  signUp: (
    username: string,
    email: string,
    password: string
  ) => Promise<StoreResponse>;
  recoverPassword: (email: string) => Promise<StoreResponse>;
  recoverPasswordToken: string | null;
  setNewPassword: (newPassword: string) => Promise<StoreResponse>;
  refreshSongs: () => void;
  isLoading: boolean;
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
  const [songs, setSongs] = useState<{
    [songId: string]: TSong;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const withAccountLoading = useCallback(withLoading(setIsLoading), [setIsLoading])

  const refreshSongs = useCallback(() => {
    songStore.getSongs().then((response) => {
      if (!response.isError && response.songs) {
        setSongs(
          response.songs.reduce(
            (prev, curr) => ({ ...prev, [curr.songId]: curr.song }),
            {}
          )
        );
      }
    });
  }, [setSongs, account]);

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

  useEffect(() => {
    refreshSongs();
  }, [refreshSongs]);

  const signUp = useCallback(
    async (
      username: string,
      email: string,
      password: string
    ): Promise<StoreResponse> => {
      const response = await accountStore.signUp(username, email, password);
      return response;
    },
    []
  );

  const login = useCallback(
    async (username: string, password: string) => {
      const response = await accountStore.login(username, password);
      if (!response.isError) {
        const loginResponse = response as accountStore.LoginResponse;
        setAccount({
          username: loginResponse.username,
          email: loginResponse.email,
        });
      }
      return response;
    },
    [setAccount]
  );

  const logout = useCallback(async () => {
    await accountStore.logout();
    setAccount(null);
    setSongs({});
  }, [setAccount, setSongs]);

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
        songs,
        isLoading,
        signUp,
        login: withAccountLoading(login),
        logout: withAccountLoading(logout),
        recoverPassword: withAccountLoading(recoverPassword),
        recoverPasswordToken,
        setNewPassword: withAccountLoading(setNewPassword),
        refreshSongs,
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
