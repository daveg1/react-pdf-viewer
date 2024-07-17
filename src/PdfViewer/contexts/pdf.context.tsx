import React, { createContext, useEffect, useState } from "react";
import { deserialise, serialise } from "../utils/local-storage";

interface PdfContext {
  numPages: number;
  setNumPages: React.Dispatch<React.SetStateAction<number>>;
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  scrollOffset: number;
  setScrollOffset: React.Dispatch<React.SetStateAction<number>>;
  hasSelection: boolean;
  setHasSelection: React.Dispatch<React.SetStateAction<boolean>>;
  isLoaded: boolean;
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

type PdfSerial = Omit<PdfContext, `set${string}` | "hasSelection" | "isLoaded">;

const LOCAL_STORAGE_KEY = "davepdf_pdf";

export const PdfContext = createContext<PdfContext>(null!);
const localState = deserialise<PdfSerial>(LOCAL_STORAGE_KEY);

export function PdfContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [numPages, setNumPages] = useState<number>(localState.numPages ?? 0);
  const [pageNumber, setPageNumber] = useState<number>(
    localState.pageNumber ?? 1,
  );
  const [scrollOffset, setScrollOffset] = useState<number>(
    localState.scrollOffset ?? 0,
  );
  const [hasSelection, setHasSelection] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // purely to trigger ui update

  useEffect(() => {
    serialise<PdfSerial>(LOCAL_STORAGE_KEY, {
      numPages,
      pageNumber,
      scrollOffset,
    });
  }, [numPages, pageNumber, scrollOffset]);

  const value: PdfContext = {
    numPages,
    setNumPages,
    pageNumber,
    setPageNumber,
    scrollOffset,
    setScrollOffset,
    hasSelection,
    setHasSelection,
    isLoaded,
    setIsLoaded,
  };

  return <PdfContext.Provider value={value}>{children}</PdfContext.Provider>;
}
