import React, { createContext, useEffect, useState } from "react";
import { deserialise, serialise } from "../utils/local-storage";

interface LayoutContext {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type LayoutSerial = Omit<LayoutContext, `set${string}`>;

const LOCAL_STORAGE_KEY = "davepdf_layout";

export const LayoutContext = createContext<LayoutContext>(null!);

export function LayoutContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const localData = deserialise<LayoutSerial>(LOCAL_STORAGE_KEY);
  const [isSidebarOpen, setIsSidebarOpen] = useState(localData.isSidebarOpen);

  useEffect(() => {
    serialise<LayoutSerial>(LOCAL_STORAGE_KEY, { isSidebarOpen });
  }, [isSidebarOpen]);

  const value = {
    isSidebarOpen,
    setIsSidebarOpen,
  };

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}
