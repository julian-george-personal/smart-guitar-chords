import { createContext, ReactNode } from "react";
import { useTabByKey } from "./song-context";

type TTabContext = {
  fretCount: number;
  stringCount: number;
};

export const TabContext = createContext<TTabContext | null>(null);

interface TabProviderProps {
  children: ReactNode;
  tabKey: number;
}

export function TabProvider({ children, tabKey }: TabProviderProps) {
  const { tab } = useTabByKey(tabKey);
  return (
    <TabContext.Provider
      value={{
        fretCount: tab.fretCount,
        stringCount: tab.stringTunings.length,
      }}
    >
      {children}
    </TabContext.Provider>
  );
}
