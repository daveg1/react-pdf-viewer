import React, { createContext, useState } from "react";

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
  const localData = deserialise();
  const [isSidebarOpen, _setIsSidebarOpen] = useState(localData.isSidebarOpen);

  // TODO: add generic way to serialise/deserialise
  function setIsSidebarOpen(value: boolean | ((v: boolean) => boolean)) {
    let newValue: boolean;

    if (typeof value === "function") {
      newValue = value(isSidebarOpen);
    } else {
      newValue = value;
    }

    serialise({ isSidebarOpen: newValue });
    _setIsSidebarOpen(newValue);
  }

  const value = {
    isSidebarOpen,
    setIsSidebarOpen,
  };

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

function serialise(data: LayoutSerial) {
  const serial = JSON.stringify(data);
  window.localStorage.setItem(LOCAL_STORAGE_KEY, serial);
}

function deserialise(): LayoutSerial {
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  return JSON.parse(raw ?? "{}") as LayoutSerial;
}
