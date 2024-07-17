import { useContext } from "react";
import { PdfContext } from "../contexts/pdf.context";
import { BookmarkContext, TransformHash } from "../contexts/bookmark.context";
import { ScrollContext } from "../contexts/virtual-scroll.context";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import { generateHash } from "../utils/generate-hash";
import { LayoutContext } from "../contexts/layout.context";

export function PdfViewerMenu() {
  const { numPages, pageNumber, hasSelection, scrollToPage } =
    useContext(PdfContext);
  const { setIsSidebarOpen } = useContext(LayoutContext);
  const { bookmarks, setBookmarks, textLayerCache } =
    useContext(BookmarkContext);
  const { virtualList } = useContext(ScrollContext);

  const MIN_PAGE = 1;
  const MAX_PAGE = numPages;

  function pageBackward() {
    const pageNum = Math.max(pageNumber - 1, MIN_PAGE);
    scrollToPage(virtualList, { pageNumber: pageNum });
  }

  function pageForward() {
    const pageNum = Math.min(pageNumber + 1, MAX_PAGE);
    scrollToPage(virtualList, { pageNumber: pageNum });
  }

  function setPage(e: React.ChangeEvent<HTMLInputElement>) {
    const value = +e.target.value || 1;
    if (value > numPages) return;
    scrollToPage(virtualList, { pageNumber: value });
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
    const virtualOffset =
      virtualList.getOffsetForIndex(pageIndex, "start")?.[0] ?? 0;
    const scrollOffset = +startNode.offsetTop + virtualOffset;

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
