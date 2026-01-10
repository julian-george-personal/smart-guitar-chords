import { ReactNode } from "react";
import { TabContext } from "./tab-context";
import { useTabById } from "../song/song-hooks";

interface TabProviderProps {
  children: ReactNode;
  tabId: string;
}

export function TabProvider({ children, tabId }: TabProviderProps) {
  const { tab } = useTabById(tabId);
  return (
    <TabContext.Provider
      value={{
        fretCount: tab.fretCount,
        stringCount: tab.stringTunings.length,
        startingFretNum: tab.startingFretNum,
      }}
    >
      {children}
    </TabContext.Provider>
  );
}
