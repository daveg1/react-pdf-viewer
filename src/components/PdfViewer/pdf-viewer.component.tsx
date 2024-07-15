import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { createContext, useRef, useState } from "react";
import { PdfViewerMenu } from "./pdf-viewer-menu.component";
import { useVirtualizer } from "@tanstack/react-virtual";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const MENU_HEIGHT = 40;
const PADDING = 32;
const VIEWPORT_HEIGHT = window.innerHeight - MENU_HEIGHT;
const PAGE_HEIGHT = window.outerHeight;
const options = { cMapUrl: "/cmaps/" };

export const PdfContext = createContext<{
  numPages: number;
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
}>(null!);

export function PdfViewer() {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const contextValue = { numPages, pageNumber, setPageNumber };
  // const iteratePages = Array.from({ length: numPages });
  const scrollRef = useRef<HTMLDivElement>(null);

  function onLoaded({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const virtualList = useVirtualizer({
    count: numPages,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => PAGE_HEIGHT,
    gap: 16,
    paddingStart: PADDING,
    paddingEnd: PADDING,
    overscan: 5,
    scrollMargin: 0,
  });

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
                <Page height={item.size} pageNumber={item.index + 1} />
              </div>
            ))}
          </div>
        </div>
      </Document>
    </>
  );
}
