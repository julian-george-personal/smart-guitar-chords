import {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import * as accountStore from "../store/account-store";
import * as songStore from "../store/song-store";
import { StoreResponse } from "../store/store";
import { TSong } from "./song-context";
import { comparePriorities, withLoading } from "../util";
import deepEqual from "deep-equal";

export type TAccount = {
  username: string;
  email: string;
};

export type TAccountContext = {
  account: TAccount | null;
  songs: {
    [songId: string]: TSong;
  };
  savedSongs: {
    [songId: string]: TSong;
  };
  setSongs: React.Dispatch<React.SetStateAction<{ [songId: string]: TSong }>>
  // Used to create suggestions for string tuning autocomplete
  orderedUsedStringTunings: string[];
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
  areAllSongsSaved: boolean;
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
  const [savedSongs, setSavedSongs] = useState<{
    [songId: string]: TSong;
  }>({});
  const [orderedUsedStringTunings, setOrderedUsedStringTunings] = useState<
    string[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const withAccountLoading = useCallback(withLoading(setIsLoading), [
    setIsLoading,
  ]);

  const refreshSongs = useCallback(() => {
    songStore.getSongs().then((response) => {
      if (!response.isError && response.songs) {
        const newSongs = response.songs.reduce(
          (prev, curr) => ({ ...prev, [curr.songId]: curr.song }),
          {}
        )
        setSongs(newSongs);
        setSavedSongs(newSongs)
      }
    });
  }, [setSongs, setSavedSongs]);

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

  const areAllSongsSaved = useMemo(() => deepEqual(savedSongs, songs), [savedSongs, songs])

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
  }, [refreshSongs]);

  return (
    <AccountContext.Provider
      value={{
        account,
        songs,
        setSongs,
        savedSongs,
        isLoading,
        signUp: withAccountLoading(signUp),
        login: withAccountLoading(login),
        logout: withAccountLoading(logout),
        recoverPassword: withAccountLoading(recoverPassword),
        recoverPasswordToken,
        setNewPassword: withAccountLoading(setNewPassword),
        refreshSongs,
        orderedUsedStringTunings,
        areAllSongsSaved
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

export const useSongById = (songId: string | null) => {
  const { songs, savedSongs, setSongs } = useAccountData()
  const song = useMemo(() => songId ? songs[songId] : null, [songs, songId, songId ? Object.values(songs[songId] || {}) : null])

  const savedSong = useMemo(() => songId ? savedSongs[songId] : null, [savedSongs, songId])

  const isSongSaved = useMemo(() => deepEqual(song, savedSong), [song, savedSong])

  const updateSong = useCallback((changes: Partial<TSong>) => {
    if (songId) setSongs((prev) => ({ ...prev, [songId]: { ...prev[songId], ...changes } }))
  }, [setSongs, songId])

  const setSong = useCallback((updater: (prev: TSong) => TSong) => {
    if (songId) setSongs((prev) => ({
      ...prev, [songId]: updater(prev[songId])
    }))
  }, [setSongs, songId])

  return useMemo(() =>
    songId ? { song, isSongSaved, updateSong, setSong } : null,
    [songId, song, isSongSaved, updateSong, setSong]
  )
}