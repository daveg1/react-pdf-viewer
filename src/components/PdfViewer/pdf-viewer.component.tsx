import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { createContext, useState } from "react";
import { PdfViewerMenu } from "./pdf-viewer-menu.component";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

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
  const iteratePages = Array.from({ length: numPages });

  function onLoaded({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <>
      <PdfContext.Provider value={contextValue}>
        <PdfViewerMenu />
      </PdfContext.Provider>

      <Document
        options={options}
        file="/sample.pdf"
        className="flex h-[calc(100vh_-_40px)] flex-col items-center gap-4 overflow-auto bg-gray-400 p-8"
        onLoadSuccess={onLoaded}
        onScroll={(e) => {
          console.log(e);
        }}
      >
        {iteratePages.map((_, index) => (
          <Page
            key={index}
            className="shadow-sm"
            pageNumber={index + 1}
            height={PAGE_HEIGHT}
          />
        ))}
      </Document>
    </>
  );
}
