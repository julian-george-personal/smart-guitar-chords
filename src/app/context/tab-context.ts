import { createContext } from "react";

type TTabContext = {
  fretCount: number;
  stringCount: number;
};

export const TabContext = createContext<TTabContext | null>(null);
