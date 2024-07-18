import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import React, { createContext, useContext, useRef } from "react";
import { PdfContext, PdfProperties } from "./pdf.context";
import {
  PAGE_GAP,
  PAGE_HEIGHT,
  SCROLL_PADDING,
} from "../constants/pdf.constants";

interface ScrollContext {
  scrollRef: React.LegacyRef<HTMLDivElement> | undefined;
  virtualList: Virtualizer<HTMLDivElement, Element>;
  scrollToPage: (scrollOptions: {
    pageNumber?: number;
    offset?: number;
    scrollBehaviour?: "smooth" | "auto";
  }) => void;
}

interface ScrollOptions {
  pageNumber?: number;
  offset?: number;
  scrollBehaviour?: "smooth" | "auto";
}

export const ScrollContext = createContext<ScrollContext>(null!);

export function ScrollContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pdfProperties, updateProperties } = useContext(PdfContext);

  const ignoreScrollEvents = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualList = useVirtualizer({
    count: pdfProperties.numPages,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => PAGE_HEIGHT * pdfProperties.scale,
    gap: PAGE_GAP,
    paddingStart: SCROLL_PADDING,
    paddingEnd: SCROLL_PADDING,
    scrollPaddingStart: 16,
    initialOffset: pdfProperties.scrollOffset,
    onChange: onVirtualScroll,
  });

  function onVirtualScroll(e: Virtualizer<HTMLDivElement, Element>) {
    if (ignoreScrollEvents.current) return;

    const offset = e.scrollOffset ?? 0;
    const items = e.getVirtualItems();
    const itemOnScreen = items.find(
      (v) => offset + SCROLL_PADDING + PAGE_HEIGHT / 2 < v.start,
    );

    if (!itemOnScreen) return;

    updateProperties({
      pageNumber: itemOnScreen.index,
      scrollOffset: virtualList.scrollOffset!,
    });
  }

  /**
   * Pre-scrolls to target to try create a better UX.
   *
   * Snaps to offset before target pageNumber or offset then smooth scrolls to target.
   * @param options
   */
  async function preScroll(options: ScrollOptions) {
    const PAGE_OFFSET = 5; // if within 5 pages, just scroll to it normally
    const TARGET_OFFSET = 1;

    if (options.offset) {
      const PAGE_SIZE = PAGE_HEIGHT + PAGE_GAP;
      const distance = virtualList.scrollOffset! - options.offset;
      const direction = Math.sign(distance);
      const threshold = PAGE_SIZE * PAGE_OFFSET;

      if (Math.abs(distance) > threshold) {
        virtualList.scrollToOffset(
          options.offset + PAGE_SIZE * TARGET_OFFSET * direction,
        );
      }
    }

    if (options.pageNumber) {
      const distance = pdfProperties.pageNumber - options.pageNumber;
      const direction = Math.sign(distance);

      if (Math.abs(distance) > PAGE_OFFSET) {
        virtualList.scrollToIndex(
          options.pageNumber - 1 + TARGET_OFFSET * direction,
        );
      }
    }
  }

  /**
   * Utility to scroll within the PDF.
   *
   * Otherwise, scroll by index if present
   * @param options
   */
  const scrollToPage = async (options: ScrollOptions) => {
    ignoreScrollEvents.current = true;

    /**
     * When smooth scrolling, if distance is greater than threshold, pre scroll so it doesn't have to travel over hundreds of pages
     */
    if (options.scrollBehaviour === "smooth") {
      await preScroll(options);
    }

    let pdfPropsToUpdate: Partial<PdfProperties> = {};

    if (options.pageNumber) {
      virtualList.scrollToIndex(options.pageNumber - 1, {
        align: "start",
        behavior: options.scrollBehaviour,
      });

      pdfPropsToUpdate = { pageNumber: options.pageNumber };
    } else if (options.offset) {
      virtualList.scrollToOffset(options.offset, {
        align: "start",
        behavior: options.scrollBehaviour,
      });

      pdfPropsToUpdate = { scrollOffset: options.offset };
    }

    ignoreScrollEvents.current = false;

    updateProperties(pdfPropsToUpdate);
  };

  const value: ScrollContext = { scrollRef, virtualList, scrollToPage };

  return (
    <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>
  );
}
