import { useCallback, useContext, useEffect, useRef } from "react";
import { PdfContext } from "../contexts/pdf.context";
import { BookmarkContext, TransformHash } from "../contexts/bookmark.context";
import { ScrollContext } from "../contexts/scroll.context";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import { generateHash } from "../utils/generate-hash";
import { LayoutContext } from "../contexts/layout.context";
import { FileContext } from "../contexts/file.context";
import { SCROLL_PADDING } from "../constants/pdf.constants";

export function PdfToolbar() {
  const { pdfProperties, updateProperties, hasSelection } =
    useContext(PdfContext);
  const { virtualList, scrollToPage } = useContext(ScrollContext);
  const { setIsSidebarOpen } = useContext(LayoutContext);
  const { bookmarks, addBookmark, textLayerCache } =
    useContext(BookmarkContext);
  const { setFile } = useContext(FileContext);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const MIN_PAGE = 1;
  const MAX_PAGE = pdfProperties.numPages;
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 2.5;
  const SCALE_STEP = 0.15;

  const nudgeOffset = useCallback(
    (direction: 1 | -1) => {
      scrollToPage({
        offset: virtualList.scrollOffset! + SCROLL_PADDING * 1.5 * direction,
      });
    },
    [scrollToPage, virtualList],
  );

  const pageBackward = useCallback(() => {
    const pageNum = Math.max(pdfProperties.pageNumber - 1, MIN_PAGE);
    scrollToPage({ pageNumber: pageNum });
  }, [pdfProperties, scrollToPage]);

  const pageForward = useCallback(() => {
    const pageNum = Math.min(pdfProperties.pageNumber + 1, MAX_PAGE);
    scrollToPage({ pageNumber: pageNum });
  }, [pdfProperties, scrollToPage, MAX_PAGE]);

  function setPage(e: React.ChangeEvent<HTMLInputElement>) {
    const value = +e.target.value || 1;
    if (value > pdfProperties.numPages) return;
    scrollToPage({ pageNumber: value });
  }

  const getTextItemsInRange = useCallback(
    (range: Range, pageIndex: number) => {
      const startNode = range.startContainer.parentElement!;
      const endNode = range.endContainer.parentElement!;

      const cachedItems = textLayerCache[pageIndex].items as TextItem[];
      const startIndex = cachedItems.findIndex(
        (item) => item.str === startNode.textContent,
      );
      const endIndex =
        startNode === endNode
          ? startIndex
          : cachedItems.findIndex((item) => item.str === endNode.textContent);

      return cachedItems.slice(startIndex, endIndex + 1);
    },
    [textLayerCache],
  );

  const bookmarkSelection = useCallback(() => {
    const selection = window.getSelection()!;
    const range = selection.getRangeAt(0);

    const selectedText = selection.toString();
    const startNode = range.startContainer.parentElement!;

    const pageContainer = startNode.closest(".react-pdf__Page") as HTMLElement;
    const pageIndex = +(pageContainer.dataset["pageNumber"] ?? 1) - 1;

    // Avoid duplicates
    const bookmarkExists = bookmarks.some(
      (book) =>
        book.selectedText === selectedText && book.pageIndex === pageIndex,
    );

    if (bookmarkExists) return;

    // scroll offsets
    const SCROLL_PADDING = 32;
    const virtualOffset =
      virtualList.getOffsetForIndex(pageIndex, "start")?.[0] ?? 0;
    const scrollOffset = +startNode.offsetTop + virtualOffset - SCROLL_PADDING;

    // selected text layer items
    const textItems = getTextItemsInRange(range, pageIndex);

    // list of all nodes between and including the start and end nodes
    const transformHashes: TransformHash[] = textItems.map(
      (item, index, array) => ({
        hash: generateHash(pageIndex, item.transform),
        startOffset: index === 0 ? range.startOffset : undefined,
        endOffset: index === array.length - 1 ? range.endOffset : undefined,
      }),
    );

    addBookmark({
      key: crypto.randomUUID(),
      selectedText,
      scrollOffset,
      pageIndex,
      transformHashes,
    });

    setIsSidebarOpen(true);
    selection.removeAllRanges();
  }, [
    bookmarks,
    addBookmark,
    getTextItemsInRange,
    setIsSidebarOpen,
    virtualList,
  ]);

  function openFile() {
    fileInputRef.current?.click();
  }

  function onFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    const file = files?.item(0);

    if (file && file.type === "application/pdf") {
      setFile(file);
    }
  }

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((v) => !v);
  }, [setIsSidebarOpen]);

  const zoomIn = useCallback(() => {
    updateProperties({
      scale: Math.min(pdfProperties.scale + SCALE_STEP, MAX_SCALE),
    });
  }, [pdfProperties, updateProperties]);

  const zoomOut = useCallback(() => {
    updateProperties({
      scale: Math.max(pdfProperties.scale - SCALE_STEP, MIN_SCALE),
    });
  }, [pdfProperties, updateProperties]);

  /**
   * Keyboard shortcuts effect
   */
  useEffect(() => {
    const keyDownListener = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        nudgeOffset(-1);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        nudgeOffset(1);
      }
      if (e.key === "o" && e.ctrlKey) {
        e.preventDefault();
        openFile();
      }
      if (e.key === "-" && e.ctrlKey) e.preventDefault();
      if (e.key === "=" && e.ctrlKey) e.preventDefault();
    };

    const keyUpListener = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") pageBackward();
      if (e.key === "ArrowRight") pageForward();
      if (e.key === "[" && e.ctrlKey) toggleSidebar();
      if (e.key === "b" && e.ctrlKey) {
        e.preventDefault();
        bookmarkSelection();
      }
      if (e.key === "-" && e.ctrlKey) zoomOut();
      if (e.key === "=" && e.ctrlKey) zoomIn();
    };

    document.addEventListener("keydown", keyDownListener);
    document.addEventListener("keyup", keyUpListener);

    return () => {
      document.removeEventListener("keydown", keyDownListener);
      document.removeEventListener("keyup", keyUpListener);
    };
  }, [
    bookmarkSelection,
    nudgeOffset,
    pageBackward,
    pageForward,
    toggleSidebar,
    zoomOut,
    zoomIn,
  ]);

  return (
    <div className="sticky inset-x-0 top-0 z-50 flex h-10 items-center bg-gradient-to-b from-zinc-600 to-zinc-700 px-2 text-white shadow-lg">
      {/* Left section */}
      <div className="flex items-center gap-2">
        <button
          className="group relative flex h-7 w-7 items-center justify-center gap-1 rounded hover:bg-white/10 active:bg-white/25"
          onClick={toggleSidebar}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
              clipRule="evenodd"
            />
          </svg>

          <span className="pointer-events-none absolute -bottom-10 left-0 flex w-max items-center gap-2 rounded bg-zinc-800 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100">
            Sidebar
            <span className="opacity-60">Ctrl+[</span>
          </span>
        </button>

        <button
          className="group relative flex h-7 w-7 items-center justify-center gap-1 rounded hover:bg-white/10 active:bg-white/25"
          onClick={openFile}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            accept="application/pdf"
            onChange={onFileUpload}
          />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="group size-4"
          >
            <path
              className="group-hover:hidden"
              d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12A1.5 1.5 0 0 0 9.62 4H12.5A1.5 1.5 0 0 1 14 5.5v1.401a2.986 2.986 0 0 0-1.5-.401h-9c-.546 0-1.059.146-1.5.401V3.5ZM2 9.5v3A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 12.5 8h-9A1.5 1.5 0 0 0 2 9.5Z"
            />
            <path
              className="hidden group-hover:block"
              d="M3 3.5A1.5 1.5 0 0 1 4.5 2h1.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12A1.5 1.5 0 0 0 9.62 4H11.5A1.5 1.5 0 0 1 13 5.5v1H3v-3ZM3.081 8a1.5 1.5 0 0 0-1.423 1.974l1 3A1.5 1.5 0 0 0 4.081 14h7.838a1.5 1.5 0 0 0 1.423-1.026l1-3A1.5 1.5 0 0 0 12.919 8H3.081Z"
            />
          </svg>

          <span className="pointer-events-none absolute -bottom-10 left-0 flex w-max items-center gap-2 rounded bg-zinc-800 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100">
            Open file
            <span className="opacity-60">Ctrl+O</span>
          </span>
        </button>

        <button
          className="group relative flex h-7 w-7 items-center justify-center gap-1 rounded p-1 hover:bg-white/10 active:bg-white/25 disabled:pointer-events-none disabled:bg-transparent disabled:opacity-50"
          disabled={!hasSelection}
          onClick={bookmarkSelection}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
            />
          </svg>

          <span className="pointer-events-none absolute -bottom-10 left-0 flex w-max items-center gap-2 rounded bg-zinc-800 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100">
            Bookmark selection
            <span className="opacity-60">Ctrl+B</span>
          </span>
        </button>

        <span>zoom: {Math.round(pdfProperties.scale * 100)}%</span>
      </div>

      {/* Middle section */}
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center gap-2">
        <button
          className="group relative flex h-7 w-7 items-center justify-center gap-1 rounded hover:bg-white/10 active:bg-white/25"
          onClick={pageBackward}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-4"
          >
            <path
              fillRule="evenodd"
              d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z"
              clipRule="evenodd"
            />
          </svg>

          <span className="pointer-events-none absolute -bottom-10 left-0 flex w-max items-center gap-2 rounded bg-zinc-800 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100">
            Prev page
            <span className="opacity-60">Left arrow</span>
          </span>
        </button>

        <span className="flex items-baseline gap-1">
          Page
          <input
            type="text"
            className="w-[5ch] rounded border border-zinc-500 bg-transparent px-1 text-end outline-none focus:bg-black/25"
            value={pdfProperties.pageNumber}
            min={1}
            max={pdfProperties.numPages}
            onChange={setPage}
          />
          of {pdfProperties.numPages}
        </span>

        <button
          className="group relative flex h-7 w-7 items-center justify-center gap-1 rounded hover:bg-white/10 active:bg-white/25"
          onClick={pageForward}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-4"
          >
            <path
              fillRule="evenodd"
              d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z"
              clipRule="evenodd"
            />
          </svg>

          <span className="pointer-events-none absolute -bottom-10 left-0 flex w-max items-center gap-2 rounded bg-zinc-800 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100">
            Next page
            <span className="opacity-60">Right arrow</span>
          </span>
        </button>
      </div>
    </div>
  );
}
