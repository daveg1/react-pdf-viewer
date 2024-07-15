import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "./pdf-viewer.component.css";
import { Document, Page, pdfjs } from "react-pdf";
import { createContext, useMemo, useRef, useState } from "react";
import { PdfViewerMenu } from "./pdf-viewer-menu.component";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PdfRenderer } from "./pdf-renderer.component";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const MENU_HEIGHT = 40;
const PADDING = 32;
const VIEWPORT_HEIGHT = window.innerHeight - MENU_HEIGHT;
const PAGE_HEIGHT = window.outerHeight;
// const options = { cMapUrl: "/cmaps/" };

export const PdfContext = createContext<{
  numPages: number;
  pageNumber: number;
  scrollToPage: (pageNumber: number) => void;
}>(null!);

export function PdfViewer(props: { options: Record<string, string> }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  // Virtual scrolling
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualList = useVirtualizer({
    count: numPages,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => PAGE_HEIGHT,
    gap: 16,
    paddingStart: PADDING,
    paddingEnd: PADDING,
    overscan: 5,
    scrollMargin: -16,
    scrollPaddingStart: 16,
  });

  function scrollToPage(pageNumber: number) {
    setPageNumber(pageNumber);
    virtualList.scrollToIndex(pageNumber - 1, {
      align: "start",
    });
  }

  const contextValue = { numPages, pageNumber, scrollToPage };

  function onLoaded({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onItemClick({ pageNumber }: { pageNumber: number }) {
    scrollToPage(pageNumber);
  }

  const options = useMemo(() => props.options, [props]);

  return (
    <>
      <PdfContext.Provider value={contextValue}>
        <PdfViewerMenu />
      </PdfContext.Provider>

      <Document
        options={options}
        file="/sample.pdf"
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
                  // onGetTextSuccess={(e) => console.log(item.index + 1, e)}
                  // customRenderer={PdfRenderer}
                  customTextRenderer={PdfRenderer}
                />
              </div>
            ))}
          </div>
        </div>
      </Document>
    </>
  );
}
