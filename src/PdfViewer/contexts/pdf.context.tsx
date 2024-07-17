import React, { createContext, useEffect, useState } from "react";
import { deserialise, serialise } from "../utils/local-storage";
import { PDFDocumentProxy } from "pdfjs-dist";

interface PdfProperties {
  fingerprint: string;
  numPages: number;
  pageNumber: number;
  scrollOffset: number;
}

interface PdfPropertiesSerial {
  files: PdfProperties[];
}

interface PdfContext {
  pdfProperties: PdfProperties;
  setPdfProperties: React.Dispatch<React.SetStateAction<PdfProperties>>;
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
  const [serial] = useState<PdfPropertiesSerial>(
    deserialise<PdfPropertiesSerial>(LOCAL_STORAGE_KEY),
  );
  const [pdfProperties, setPdfProperties] = useState<PdfProperties>({
    fingerprint: "",
    numPages: 0,
    pageNumber: 1,
    scrollOffset: 0,
  });

  const [hasSelection, setHasSelection] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // purely to trigger ui update

  useEffect(() => {
    if (!pdfProperties.fingerprint) return;

    const newSerial: PdfPropertiesSerial = { files: [...(serial.files ?? [])] };
    const index = newSerial.files.findIndex(
      (f) => f.fingerprint === pdfProperties.fingerprint,
    );

    if (index > -1) {
      newSerial.files[index] = { ...pdfProperties };
    } else {
      newSerial.files.push({ ...pdfProperties });
    }

    serialise<PdfPropertiesSerial>(LOCAL_STORAGE_KEY, newSerial);
  }, [pdfProperties, serial]);

  /**
   * Will try to use local storage first, then apply the provided document proxy.
   * @param doc
   * @returns state if any is loaded from localStorage, otherwise null if it's from scratch
   */
  function getInitialPdfState(doc: PDFDocumentProxy) {
    const fingerprint = doc.fingerprints[0];

    if (fingerprint && serial.files) {
      const localValue = serial.files.find(
        (f) => f.fingerprint === fingerprint,
      );

      if (localValue) {
        setPdfProperties({ ...localValue });
        return localValue;
      }
    }

    const newValue: PdfProperties = {
      scrollOffset: 0,
      pageNumber: 1,
      numPages: doc.numPages,
      fingerprint: doc.fingerprints[0],
    };

    setPdfProperties(newValue);
    return newValue;
  }

  const value: PdfContext = {
    pdfProperties,
    setPdfProperties,
    hasSelection,
    setHasSelection,
    isLoaded,
    setIsLoaded,
    getInitialPdfState,
  };

  return <PdfContext.Provider value={value}>{children}</PdfContext.Provider>;
}
