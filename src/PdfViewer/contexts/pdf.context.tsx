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
  fingerprint: string;
  setFingerprint: React.Dispatch<React.SetStateAction<string>>;
}

type PdfSerial = Omit<PdfContext, `set${string}` | "hasSelection" | "isLoaded">;

const LOCAL_STORAGE_KEY = "davepdf_pdfs";

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
  const [fingerprint, setFingerprint] = useState("");

  useEffect(() => {
    serialise<PdfSerial>(LOCAL_STORAGE_KEY, {
      numPages,
      pageNumber,
      scrollOffset,
      fingerprint,
    });
  }, [numPages, pageNumber, scrollOffset, fingerprint]);

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
    fingerprint,
    setFingerprint,
  };

  return <PdfContext.Provider value={value}>{children}</PdfContext.Provider>;
}
