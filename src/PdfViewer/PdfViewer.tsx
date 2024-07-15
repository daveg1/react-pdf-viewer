import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "./PdfViewer.css";
import { Document, Page, pdfjs } from "react-pdf";
import { createContext, useMemo, useRef, useState } from "react";
import { PdfViewerMenu } from "./components/PdfViewerMenu";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import { renderPdfText } from "./utils/render-pdf-text";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const MENU_HEIGHT = 40;
const SCROLL_PADDING = 32;
const VIEWPORT_HEIGHT = window.innerHeight - MENU_HEIGHT;
const PAGE_HEIGHT = window.outerHeight;
// const options = { cMapUrl: "/cmaps/" };

export const PdfContext = createContext<{
  numPages: number;
  pageNumber: number;
  scrollToPage: (pageNumber: number) => void;
  hasSelection: boolean;
}>(null!);

export function PdfViewer(props: { options: Record<string, string> }) {
  /**
   * Hooks and state
   */
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageScale] = useState(1);
  const [hasSelection, setHasSelection] = useState(false);

  /**
   * Refs
   */
  const DOMDocumentRef = useRef(document);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Virtual scrolling
  const virtualList = useVirtualizer({
    count: numPages,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => PAGE_HEIGHT * pageScale,
    gap: 16,
    paddingStart: SCROLL_PADDING,
    paddingEnd: SCROLL_PADDING,
    scrollPaddingStart: 16,
    onChange: onVirtualScroll,
  });

  /**
   * Context values
   */

  function scrollToPage(pageNumber: number) {
    setPageNumber(pageNumber);
    virtualList.scrollToIndex(pageNumber - 1, {
      align: "start",
    });
  }

  const contextValue = { numPages, pageNumber, scrollToPage, hasSelection };

  /**
   * Event Listeners
   */

  function onLoaded({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onItemClick({ pageNumber }: { pageNumber: number }) {
    scrollToPage(pageNumber);
  }

  function onVirtualScroll(e: Virtualizer<HTMLDivElement, Element>) {
    const offset = e.scrollOffset ?? 0;
    const items = e.getVirtualItems();
    const itemOnScreen = items.find(
      (v) => offset + SCROLL_PADDING + PAGE_HEIGHT / 2 < v.start,
    );

    if (!itemOnScreen) return;
    setPageNumber(itemOnScreen.index);
  }

  DOMDocumentRef.current.addEventListener("selectionchange", () => {
    const sel = window.getSelection()?.toString().trim();
    setHasSelection(!!sel);
  });

  const options = useMemo(() => props.options, [props]);

  return (
    <>
      <PdfContext.Provider value={contextValue}>
        <PdfViewerMenu />
      </PdfContext.Provider>

      <Document
        options={options}
        file="/russian.pdf"
        className="bg-gray-400"
        onLoadSuccess={onLoaded}
        onItemClick={onItemClick}
        // inputRef={scrollRef} // <--- experiment with this
      >
        <div
          ref={scrollRef}
          className="overflow-auto"
          style={{ height: `${VIEWPORT_HEIGHT}px` }}
        >
          <div
            className="relative w-full"
            style={{ height: `${virtualList.getTotalSize()}px` }}
          >
            {virtualList.getVirtualItems().map((item) => (
              <div
                key={item.key}
                className="absolute left-0 top-0 flex w-full justify-center"
                style={{
                  height: `${item.size}px`,
                  transform: `translateY(${item.start}px)`,
                }}
              >
                <Page
                  className="shadow-md"
                  height={item.size}
                  pageNumber={item.index + 1}
                  scale={pageScale}
                  // onGetTextSuccess={(e) => console.log(item.index + 1, e)}
                  // customRenderer={PdfRenderer}
                  customTextRenderer={renderPdfText}
                />
              </div>
            ))}
          </div>
        </div>
      </Document>
    </>
  );
}
