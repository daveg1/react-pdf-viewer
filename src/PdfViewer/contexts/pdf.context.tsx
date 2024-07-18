import React, { createContext, useState } from "react";
import { deserialise, serialise } from "../utils/local-storage";
import { PDFDocumentProxy } from "pdfjs-dist";

export interface PdfProperties {
  fingerprint: string;
  numPages: number;
  pageNumber: number;
  scrollOffset: number;
}

/**
 * Map of PdfProperties indexed by the pdf fingerprint
 */
type PdfPropertiesSerial = {
  [Key: string]: PdfProperties;
};

interface PdfContext {
  fingerprint: string;
  setFingerprint: React.Dispatch<React.SetStateAction<string>>;
  pdfProperties: PdfProperties;
  updateProperties: (props: Partial<PdfProperties>) => void;
  hasSelection: boolean;
  setHasSelection: React.Dispatch<React.SetStateAction<boolean>>;
  isLoaded: boolean;
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  getInitialPdfState: (doc: PDFDocumentProxy) => PdfProperties;
}

const LOCAL_STORAGE_KEY = "davepdf_pdfs";

export const PdfContext = createContext<PdfContext>(null!);

export function PdfContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [serial, setSerial] = useState<PdfPropertiesSerial>(
    deserialise<PdfPropertiesSerial>(LOCAL_STORAGE_KEY),
  );
  const [pdfProperties, setPdfProperties] = useState<PdfProperties>({
    fingerprint: "",
    numPages: 0,
    pageNumber: 1,
    scrollOffset: 0,
  });
  const [fingerprint, setFingerprint] = useState("");
  const [hasSelection, setHasSelection] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // purely to trigger ui update

  function updateSerial(newProps: PdfProperties) {
    const newSerial = { ...serial, [newProps.fingerprint]: newProps };

    setSerial(newSerial);
    serialise<PdfPropertiesSerial>(LOCAL_STORAGE_KEY, newSerial);
  }

  function updateProperties(props: Partial<PdfProperties>) {
    const newProps = { ...pdfProperties, ...props };

    setFingerprint(newProps.fingerprint);
    setPdfProperties(newProps);
    updateSerial(newProps);
  }

  /**
   * Will try to use local storage first, then apply the provided document proxy.
   * @param doc
   * @returns state if any is loaded from localStorage, otherwise null if it's from scratch
   */
  function getInitialPdfState(doc: PDFDocumentProxy) {
    const fingerprint = doc.fingerprints[0];
    setFingerprint(fingerprint);

    if (fingerprint in serial) {
      setPdfProperties({ ...serial[fingerprint] });
      return serial[fingerprint];
    }

    const newValue: PdfProperties = {
      scrollOffset: 0,
      pageNumber: 1,
      numPages: doc.numPages,
      fingerprint: doc.fingerprints[0],
    };

    updateProperties(newValue);
    return newValue;
  }

  const value: PdfContext = {
    fingerprint,
    setFingerprint,
    pdfProperties,
    updateProperties,
    hasSelection,
    setHasSelection,
    isLoaded,
    setIsLoaded,
    getInitialPdfState,
  };

  return <PdfContext.Provider value={value}>{children}</PdfContext.Provider>;
}
