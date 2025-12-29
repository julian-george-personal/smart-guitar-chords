import { useState, useCallback, useEffect, ReactNode } from "react";
import * as accountStore from "./account-store";
import * as songStore from "../song/song-store";
import { StoreResponse } from "../store";
import { comparePriorities, withLoading } from "../../util";
import { AccountContext } from "./account-context";
import { TSong } from "../song/song-types";
import { TAccount } from "./account-types";

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
  const [orderedUsedStringTunings, setOrderedUsedStringTunings] = useState<
    string[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const withAccountLoading = useCallback(withLoading(setIsLoading), [
    setIsLoading,
  ]);

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
  }, [setSongs]);

  useEffect(() => {
    const usedStringTuningsWithFrequencies: Record<string, number> = {};
    for (const tuning of Object.values(songs).map((song) =>
      song.stringTunings.join(",")
    )) {
      if (tuning in usedStringTuningsWithFrequencies) {
        usedStringTuningsWithFrequencies[tuning]++;
      } else {
        usedStringTuningsWithFrequencies[tuning] = 1;
      }
    }
    const newOrderedUsedStringTunings = Object.entries(
      usedStringTuningsWithFrequencies
    )
      .sort((a, b) => comparePriorities(a[1], b[1]) || 0)
      .map((tuningPair) => tuningPair[0]);
    setOrderedUsedStringTunings(newOrderedUsedStringTunings);
  }, [songs]);

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
  }, [refreshSongs, account]);

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
        signUp: withAccountLoading(signUp),
        login: withAccountLoading(login),
        logout: withAccountLoading(logout),
        recoverPassword: withAccountLoading(recoverPassword),
        recoverPasswordToken,
        setNewPassword: withAccountLoading(setNewPassword),
        refreshSongs,
        orderedUsedStringTunings,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}
