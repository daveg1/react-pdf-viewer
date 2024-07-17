import React, { createContext, useState } from "react";

interface FileContext {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

export const FileContext = createContext<FileContext>(null!);

export function FileContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [file, setFile] = useState<File | null>(null);

  const value = { file, setFile };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
}
