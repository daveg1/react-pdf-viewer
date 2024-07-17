import { useContext, useRef } from "react";
import { PdfContext } from "../contexts/pdf.context";
import { BookmarkContext, TransformHash } from "../contexts/bookmark.context";
import { ScrollContext } from "../contexts/scroll.context";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import { generateHash } from "../utils/generate-hash";
import { LayoutContext } from "../contexts/layout.context";
import { FileContext } from "../contexts/file.context";

export function PdfViewerMenu() {
  const { numPages, pageNumber, hasSelection } = useContext(PdfContext);
  const { virtualList, scrollToPage } = useContext(ScrollContext);
  const { setIsSidebarOpen } = useContext(LayoutContext);
  const { bookmarks, setBookmarks, textLayerCache } =
    useContext(BookmarkContext);
  const { setFile } = useContext(FileContext);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const MIN_PAGE = 1;
  const MAX_PAGE = numPages;

  function pageBackward() {
    const pageNum = Math.max(pageNumber - 1, MIN_PAGE);
    scrollToPage({ pageNumber: pageNum });
  }

  function pageForward() {
    const pageNum = Math.min(pageNumber + 1, MAX_PAGE);
    scrollToPage({ pageNumber: pageNum });
  }

  function setPage(e: React.ChangeEvent<HTMLInputElement>) {
    const value = +e.target.value || 1;
    if (value > numPages) return;
    scrollToPage({ pageNumber: value });
  }

  async function bookmarkText() {
    const selection = window.getSelection()!;
    const selectedText = selection.toString();
    const startNode = selection.anchorNode!.parentElement!;
    const endNode = selection.focusNode!.parentElement!;
    const pageIndex =
      +(startNode.parentElement?.parentElement?.dataset["pageNumber"] ?? 1) - 1;

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

    // selection nodes
    const cachedItems = textLayerCache[pageIndex].items as TextItem[];
    const startIndex = cachedItems.findIndex(
      (item) => item.str === startNode.textContent,
    );
    const endIndex =
      startNode === endNode
        ? startIndex
        : cachedItems.findIndex((item) => item.str === endNode.textContent);

    // list of all nodes between and including the start and end nodes
    const transformHashes: TransformHash[] = cachedItems
      .slice(startIndex, endIndex + 1)
      .map((item, index, array) => {
        return {
          hash: generateHash(pageIndex, item.transform),
          startOffset: index === 0 ? selection.anchorOffset : undefined,
          endOffset:
            index === array.length - 1 ? selection.focusOffset : undefined,
        };
      });

    setBookmarks((value) => [
      ...value,
      {
        key: crypto.randomUUID(),
        selectedText,
        scrollOffset,
        pageIndex,
        transformHashes,
      },
    ]);

    setIsSidebarOpen(true);
  }

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

  function onSidebarButtonClick() {
    setIsSidebarOpen((v) => !v);
  }

  return (
    <div className="sticky inset-x-0 top-0 z-50 flex h-10 items-center bg-zinc-700 px-2 text-white shadow-lg">
      {/* Left section */}
      <div className="flex items-center gap-2">
        <button
          className="group relative flex h-7 w-7 items-center justify-center gap-1 rounded hover:bg-white/10 active:bg-white/25"
          onClick={onSidebarButtonClick}
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

          <span className="pointer-events-none absolute -bottom-8 left-0 w-max rounded bg-zinc-800 px-2 opacity-0 transition-opacity group-hover:opacity-100">
            Sidebar
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

          <span className="pointer-events-none absolute -bottom-8 left-0 w-max rounded bg-zinc-800 px-2 opacity-0 transition-opacity group-hover:opacity-100">
            Open file
          </span>
        </button>

        <button
          className="group relative flex h-7 w-7 items-center justify-center gap-1 rounded p-1 hover:bg-white/10 active:bg-white/25 disabled:pointer-events-none disabled:bg-transparent disabled:opacity-50"
          disabled={!hasSelection}
          onClick={bookmarkText}
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

          <span className="pointer-events-none absolute -bottom-8 -left-8 w-max rounded bg-zinc-800 px-2 opacity-0 transition-opacity group-hover:opacity-100">
            Bookmark selected text
          </span>
        </button>
      </div>

      {/* Middle section */}
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center gap-4">
        <button
          className="grid h-7 w-7 place-items-center rounded bg-white/10 hover:bg-white/25"
          onClick={pageBackward}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <span className="flex items-baseline gap-1">
          Page
          <input
            type="text"
            className="w-[5ch] rounded border border-zinc-500 bg-transparent px-1 text-end outline-none focus:bg-black/25"
            value={pageNumber}
            min={1}
            max={numPages}
            onChange={setPage}
          />
          of {numPages}
        </span>

        <button
          className="grid h-7 w-7 place-items-center rounded bg-white/10 hover:bg-white/25"
          onClick={pageForward}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
