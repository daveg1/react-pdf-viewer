import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "./PdfViewer.css";
import { Document, Page, pdfjs } from "react-pdf";
import { useCallback, useContext, useMemo, useRef } from "react";
import { PdfViewerMenu } from "./components/PdfViewerMenu";
import { renderPdfText, RenderProps } from "./utils/render-pdf-text";
import {
  DocumentInitParameters,
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

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfViewerProps {
  file: string;
  options: DocumentInitParameters;
}

function Layout(props: PdfViewerProps) {
  const options = useMemo(() => props.options, [props]);

  const { setNumPages, setHasSelection } = useContext(PdfContext);
  const { scrollRef, virtualList, scrollToPage } = useContext(ScrollContext);
  const { bookmarks, textLayerCache, setTextLayerCache } =
    useContext(BookmarkContext);

  /**
   * Selection detection
   */

  const DOMDocumentRef = useRef(document);
  DOMDocumentRef.current.addEventListener("selectionchange", () => {
    const sel = window.getSelection();
    const startNode = sel?.anchorNode?.parentElement?.parentElement;
    const endNode = sel?.focusNode?.parentElement?.parentElement;
    const isInsideTextLayer =
      !!startNode?.classList?.contains("textLayer") &&
      !!endNode?.classList.contains("textLayer");

    const hasSel = isInsideTextLayer && !!sel?.toString().trim();

    setHasSelection(hasSel);
  });

  /**
   * Event Listeners
   */

  function onLoaded({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onItemClick({ pageNumber }: { pageNumber: number }) {
    scrollToPage({ pageNumber });
  }

  function onTextLayerLoaded(textLayer: TextContent, pageIndex: number) {
    if (!(pageIndex in textLayerCache)) {
      setTextLayerCache((cache) => ({ ...cache, [pageIndex]: textLayer }));
    }
  }

  /**
   * Text renderer
   */
  const textRenderer = useCallback(
    (props: RenderProps) => renderPdfText(props, bookmarks),
    [bookmarks],
  );

  return (
    <>
      <PdfViewerMenu />

      <Document
        file={props.file}
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
    <PdfContextProvider>
      <LayoutContextProvider>
        <ScrollContextProvider>
          <BookmarkContextProvider>
            <Layout {...props} />
          </BookmarkContextProvider>
        </ScrollContextProvider>
      </LayoutContextProvider>
    </PdfContextProvider>
  );
}
