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
}

type PdfSerial = Omit<PdfContext, `set${string}` | "hasSelection">;

const LOCAL_STORAGE_KEY = "davepdf_pdf";

export const PdfContext = createContext<PdfContext>(null!);

export function PdfContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const localState = deserialise<PdfSerial>(LOCAL_STORAGE_KEY);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(localState.pageNumber);
  const [scrollOffset, setScrollOffset] = useState<number>(
    localState.scrollOffset,
  );
  const [hasSelection, setHasSelection] = useState(false);

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
  };

  return <PdfContext.Provider value={value}>{children}</PdfContext.Provider>;
}
