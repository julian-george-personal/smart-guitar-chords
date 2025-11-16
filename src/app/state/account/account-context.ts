import { createContext } from "react";
import { StoreResponse } from "../store";
import { TAccount } from "./account-types";
import { TSong } from "../song/song-types";

export type TAccountContext = {
    account: TAccount | null;
    songs: {
        [songId: string]: TSong;
    };
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
    };

export const AccountContext = createContext<TAccountContext | null>(null);

