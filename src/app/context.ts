import { createContext } from "react";

type TabContextType = {
  fretCount: number;
};

export const TabContext = createContext<TabContextType | null>(null);
