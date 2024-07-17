import React, { createContext, useEffect, useState } from "react";
import { deserialise, serialise } from "../utils/local-storage";

interface PdfProperties {
  fingerprint: string;
  numPages: number;
  pageNumber: number;
  scrollOffset: number;
}

interface PdfContext {
  pdfProperties: PdfProperties;
  setPdfProperties: React.Dispatch<React.SetStateAction<PdfProperties>>;
  hasSelection: boolean;
  setHasSelection: React.Dispatch<React.SetStateAction<boolean>>;
  isLoaded: boolean;
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

const LOCAL_STORAGE_KEY = "davepdf_pdfs";

export const PdfContext = createContext<PdfContext>(null!);
const localState = deserialise<PdfProperties>(LOCAL_STORAGE_KEY);

export function PdfContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pdfProperties, setPdfProperties] = useState<PdfProperties>(
    localState ?? {
      fingerprint: "",
      numPages: 0,
      pageNumber: 1,
      scrollOffset: 0,
    },
  );

  const [hasSelection, setHasSelection] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // purely to trigger ui update

  useEffect(() => {
    serialise<PdfProperties>(LOCAL_STORAGE_KEY, pdfProperties);
  }, [pdfProperties]);

  const value: PdfContext = {
    pdfProperties,
    setPdfProperties,
    hasSelection,
    setHasSelection,
    isLoaded,
    setIsLoaded,
  };

  return <PdfContext.Provider value={value}>{children}</PdfContext.Provider>;
}
