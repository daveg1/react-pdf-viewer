import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "./PdfViewer.css";
import { Document, Page, pdfjs } from "react-pdf";
import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { PdfViewerMenu } from "./components/PdfViewerMenu";
import { renderPdfText, RenderProps } from "./utils/render-pdf-text";
import {
  DocumentInitParameters,
  PDFDocumentProxy,
  TextContent,
} from "pdfjs-dist/types/src/display/api";
import { PdfContext, PdfContextProvider } from "./contexts/pdf.context";
import {
  BookmarkContext,
  BookmarkContextProvider,
} from "./contexts/bookmark.context";
import { PdfSidebar } from "./components/PdfSidebar";
import {
  ScrollContext,
  ScrollContextProvider,
} from "./contexts/scroll.context";
import { PAGE_HEIGHT, VIEWPORT_HEIGHT } from "./constants/pdf.constants";
import { LayoutContextProvider } from "./contexts/layout.context";
import { FileContext, FileContextProvider } from "./contexts/file.context";
import { findTextLayer } from "./utils/find-text-layer";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfViewerProps {
  options: DocumentInitParameters;
}

function Layout(props: PdfViewerProps) {
  const options = useMemo(() => props.options, [props]);

  const { file } = useContext(FileContext);
  const { setHasSelection, setIsLoaded, getInitialPdfState } =
    useContext(PdfContext);
  const { scrollRef, virtualList, scrollToPage } = useContext(ScrollContext);
  const { bookmarks, textLayerCache, setTextLayerCache } =
    useContext(BookmarkContext);

  /**
   * Event Listeners
   */

  async function onLoaded(doc: PDFDocumentProxy) {
    setIsLoaded(true);

    const state = getInitialPdfState(doc);
    virtualList.scrollOffset = state.scrollOffset;
  }

  function onItemClick({ pageNumber }: { pageNumber: number }) {
    scrollToPage({ pageNumber });
  }

  function onTextLayerLoaded(textLayer: TextContent, pageIndex: number) {
    if (!(pageIndex in textLayerCache)) {
      setTextLayerCache((cache) => ({ ...cache, [pageIndex]: textLayer }));
    }
  }

  function highlightBookmarks(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const target = e.target as HTMLElement;
    if (target.nodeName !== "MARK") return resetHighlights();

    const highlights = document.querySelectorAll(
      ".textLayer mark",
    ) as NodeListOf<HTMLElement>;

    highlights.forEach((el) => {
      if (el.id === target.id) {
        el.classList.add("ring-2", "ring-black", "!bg-blue-300/50");
      } else {
        el.classList.remove("ring-2", "ring-black", "!bg-blue-300/50");
      }
    });
  }

  function resetHighlights() {
    const highlights = document.querySelectorAll(
      ".textLayer mark",
    ) as NodeListOf<HTMLElement>;

    highlights.forEach((el) =>
      el.classList.remove("ring-2", "ring-black", "!bg-blue-300/50"),
    );
  }

  /**
   * Text renderer
   */
  const textRenderer = useCallback(
    (props: RenderProps) => renderPdfText(props, bookmarks),
    [bookmarks],
  );

  /**
   * Selection detection
   */

  useEffect(() => {
    const selectionListener = () => {
      const sel = window.getSelection();

      if (!sel || !sel.anchorNode || !sel.focusNode) {
        setHasSelection(false);
        return;
      }

      const startNode = findTextLayer(sel.anchorNode!);
      const endNode = findTextLayer(sel.focusNode!);

      const isInsideTextLayer =
        !!startNode?.classList?.contains("textLayer") &&
        !!endNode?.classList.contains("textLayer");

      const hasSel = isInsideTextLayer && !!sel?.toString().trim();

      setHasSelection(hasSel);
    };

    document.addEventListener("selectionchange", selectionListener);

    return () => {
      document.removeEventListener("selectionchange", selectionListener);
    };
  }, [setHasSelection]);

  return (
    <>
      <PdfViewerMenu />

      <Document
        file={file}
        options={options}
        className="flex justify-center bg-gray-400"
        onLoadSuccess={onLoaded}
        onItemClick={onItemClick}
        loading={null}
        // inputRef={scrollRef} // <--- experiment with this
      >
        <PdfSidebar />

        <div
          ref={scrollRef}
          className="w-full overflow-auto"
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
                  loading={
                    <div
                      className="opacity-50"
                      style={{ height: `${PAGE_HEIGHT}px` }}
                    ></div>
                  }
                  customTextRenderer={textRenderer}
                  onGetTextSuccess={(e) => onTextLayerLoaded(e, item.index)}
                  onMouseOver={(e) => highlightBookmarks(e)}
                  onMouseLeave={() => resetHighlights()}
                />
              </div>
            ))}
          </div>
        </div>
      </Document>
    </>
  );
}

export function PdfViewer(props: PdfViewerProps) {
  return (
    <FileContextProvider>
      <PdfContextProvider>
        <LayoutContextProvider>
          <ScrollContextProvider>
            <BookmarkContextProvider>
              <Layout {...props} />
            </BookmarkContextProvider>
          </ScrollContextProvider>
        </LayoutContextProvider>
      </PdfContextProvider>
    </FileContextProvider>
  );
}
