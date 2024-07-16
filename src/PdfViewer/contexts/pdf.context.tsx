import { Virtualizer } from "@tanstack/react-virtual";
import React, { createContext, useState } from "react";

interface IPdfContext {
  numPages: number;
  setNumPages: React.Dispatch<React.SetStateAction<number>>;
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  hasSelection: boolean;
  setHasSelection: React.Dispatch<React.SetStateAction<boolean>>;
  scrollToPage: (
    virtualList: Virtualizer<HTMLDivElement, Element>,
    pageNumber: number,
  ) => void;
}

export const PdfContext = createContext<IPdfContext>(null!);

export function PdfContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasSelection, setHasSelection] = useState(false);

  function scrollToPage(
    virtualList: Virtualizer<HTMLDivElement, Element>,
    pageNumber: number,
  ) {
    setPageNumber(pageNumber);
    virtualList.scrollToIndex(pageNumber - 1, {
      align: "start",
    });
  }

  const value = {
    numPages,
    setNumPages,
    pageNumber,
    setPageNumber,
    hasSelection,
    setHasSelection,
    scrollToPage,
  };

  return <PdfContext.Provider value={value}>{children}</PdfContext.Provider>;
}
