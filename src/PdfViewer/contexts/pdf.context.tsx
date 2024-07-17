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
    scrollOptions: {
      pageNumber?: number;
      offset?: number;
      scrollBehaviour?: "smooth" | "auto";
    },
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

  // TODO: move scrollToPage to ScrollContext
  const scrollToPage: IPdfContext["scrollToPage"] = (
    virtualList: Virtualizer<HTMLDivElement, Element>,
    options: {
      pageNumber?: number;
      offset?: number;
      scrollBehaviour?: "smooth" | "auto";
    },
  ) => {
    // TODO: if smooth behaviour, auto scroll to 1-2 pages behind, then smooth scroll to target page.
    // this creates a better UX experience, since you don't have to scroll past hundreds of pages

    if (options.pageNumber) {
      setPageNumber(options.pageNumber);
      virtualList.scrollToIndex(options.pageNumber - 1, {
        align: "start",
        behavior: options.scrollBehaviour,
      });
      return;
    }

    if (options.offset) {
      virtualList.scrollToOffset(options.offset, {
        align: "start",
        behavior: options.scrollBehaviour,
      });
      return;
    }
  };

  const value: IPdfContext = {
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
