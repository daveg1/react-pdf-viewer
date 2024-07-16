import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "./PdfViewer.css";
import { Document, Page, pdfjs } from "react-pdf";
import { createContext, useContext, useMemo, useRef } from "react";
import { PdfViewerMenu } from "./components/PdfViewerMenu";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import { renderPdfText } from "./utils/render-pdf-text";
import {
  DocumentInitParameters,
  TextContent,
} from "pdfjs-dist/types/src/display/api";
import { PdfContext, PdfContextProvider } from "./contexts/pdf.context";
import {
  BookmarkContext,
  BookmarkContextProvider,
} from "./contexts/bookmark.context";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const MENU_HEIGHT = 40;
const SCROLL_PADDING = 32;
const VIEWPORT_HEIGHT = window.innerHeight - MENU_HEIGHT;
const PAGE_HEIGHT = window.outerHeight;

export const ScrollContext = createContext<{
  virtualList: Virtualizer<HTMLDivElement, Element>;
}>(null!);

interface PdfViewerProps {
  file: string;
  options: DocumentInitParameters;
}

function Layout(props: PdfViewerProps) {
  const options = useMemo(() => props.options, [props]);
  const {
    numPages,
    setNumPages,
    setPageNumber,
    setHasSelection,
    scrollToPage,
  } = useContext(PdfContext);

  const { bookmarks, textLayerCache, setTextLayerCache } =
    useContext(BookmarkContext);

  /**
   * Virtual scrolling
   */

  const scrollRef = useRef<HTMLDivElement>(null);
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

  /**
   * Selection detection
   */

  const DOMDocumentRef = useRef(document);
  DOMDocumentRef.current.addEventListener("selectionchange", () => {
    const sel = window.getSelection()?.toString().trim();
    setHasSelection(!!sel);
  });

  /**
   * Event Listeners
   */

  function onLoaded({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onItemClick({ pageNumber }: { pageNumber: number }) {
    scrollToPage(virtualList, pageNumber);
  }

  function onTextLayerLoaded(textLayer: TextContent, pageIndex: number) {
    if (!(pageIndex in textLayerCache)) {
      setTextLayerCache((cache) => ({ ...cache, [pageIndex]: textLayer }));
    }
  }

  return (
    <>
      <ScrollContext.Provider value={{ virtualList }}>
        <PdfViewerMenu />
      </ScrollContext.Provider>

      {!!bookmarks && !!bookmarks.length && (
        <div className="absolute left-12 top-16 z-50 h-[100px] w-[400px] rounded bg-zinc-200 p-4">
          <h3 className="mb-1 text-lg font-medium leading-tight">Bookmarks</h3>

          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.transformHash}
              className="cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap hover:underline"
              onClick={() => scrollToPage(virtualList, bookmark.pageIndex + 1)}
            >
              [#{bookmark.pageIndex + 1}] {bookmark.text}
            </div>
          ))}
        </div>
      )}

      <Document
        file={props.file}
        options={options}
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
                  customTextRenderer={renderPdfText}
                  onGetTextSuccess={(e) => onTextLayerLoaded(e, item.index)}
                />
              </div>
            ))}
          </div>
        </div>
      </Document>
    </>
  );
}

export function PdfViewer({ file, options }: PdfViewerProps) {
  return (
    <PdfContextProvider>
      <BookmarkContextProvider>
        <Layout file={file} options={options} />
      </BookmarkContextProvider>
    </PdfContextProvider>
  );
}
