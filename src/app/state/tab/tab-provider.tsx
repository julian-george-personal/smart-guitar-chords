import { ReactNode } from "react";
import { TabContext } from "./tab-context";
import { useTabByKey } from "../song/song-hooks";

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
        startingFretNum: tab.startingFretNum
      }}
    >
      {children}
    </TabContext.Provider>
  );
}
