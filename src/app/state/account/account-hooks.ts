import { useContext } from "react";
import { AccountContext } from "./account-context";

export const useAccountData = () => {
    const context = useContext(AccountContext);
    if (context === null) {
      throw new Error("AccountContext is null");
    }
    return context;
  };