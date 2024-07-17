import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import React, { createContext, useContext, useRef } from "react";
import { PdfContext } from "./pdf.context";
import { PAGE_HEIGHT, SCROLL_PADDING } from "../constants/pdf.constants";

export const ScrollContext = createContext<{
  scrollRef: React.LegacyRef<HTMLDivElement> | undefined;
  virtualList: Virtualizer<HTMLDivElement, Element>;
}>(null!);

export function ScrollContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { numPages, setPageNumber } = useContext(PdfContext);

  const scrollRef = useRef<HTMLDivElement>(null);

  // TODO: set initial offset based on localStorage state
  const virtualList = useVirtualizer({
    count: numPages,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => PAGE_HEIGHT,
    gap: 16,
    paddingStart: SCROLL_PADDING,
    paddingEnd: SCROLL_PADDING,
    scrollPaddingStart: 16,
    onChange: onVirtualScroll,
  });

  function onVirtualScroll(e: Virtualizer<HTMLDivElement, Element>) {
    const offset = e.scrollOffset ?? 0;
    const items = e.getVirtualItems();
    const itemOnScreen = items.find(
      (v) => offset + SCROLL_PADDING + PAGE_HEIGHT / 2 < v.start,
    );

    if (!itemOnScreen) return;
    setPageNumber(itemOnScreen.index);
  }

  const value = { scrollRef, virtualList };

  return (
    <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>
  );
}
