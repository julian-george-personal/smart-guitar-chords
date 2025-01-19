import { createContext } from "react";

type TabContextType = {
  fretCount: number;
  stringCount: number;
};

export const TabContext = createContext<TabContextType | null>(null);
