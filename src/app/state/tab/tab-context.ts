import { createContext } from "react";

type TTabContext = {
    fretCount: number;
    stringCount: number;
    startingFretNum: number;
  };
  
  export const TabContext = createContext<TTabContext | null>(null);