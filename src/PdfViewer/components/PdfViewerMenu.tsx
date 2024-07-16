import { useContext } from "react";
import { PdfContext } from "../contexts/pdf.context";
import { BookmarkContext } from "../contexts/bookmark.context";
import { ScrollContext } from "../PdfViewer";

export function PdfViewerMenu() {
  const { numPages, pageNumber, hasSelection, scrollToPage } =
    useContext(PdfContext);

  const { bookmarks, setBookmarks } = useContext(BookmarkContext);
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

    // Avoid duplicates
    if (bookmarks.find((book) => book.selectedText === selectedText)) return;

    const node = selection.anchorNode!.parentElement!;
    const pageIndex =
      +(node.parentElement?.parentElement?.dataset["pageNumber"] ?? 1) - 1;
    const virtualOffset =
      virtualList.getOffsetForIndex(pageIndex, "start")?.[0] ?? 0;

    const scrollOffset = +node.offsetTop + virtualOffset;

    setBookmarks((value) => [
      ...value,
      {
        selectedText,
        scrollOffset,
        pageIndex,
      },
    ]);
  }

  return (
    <div className="sticky inset-x-0 top-0 z-50 grid grid-cols-3 items-center justify-center gap-4 bg-zinc-700 py-2 text-white shadow-lg">
      <div className="flex justify-end">
        <button
          className="group relative flex items-center justify-center gap-1 rounded-sm p-1 hover:bg-white/10 active:bg-white/25 disabled:pointer-events-none disabled:bg-transparent disabled:opacity-50"
          disabled={!hasSelection}
          onClick={bookmarkText}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
            />
          </svg>

          <span className="pointer-events-none absolute -bottom-8 w-max rounded bg-zinc-800 px-2 opacity-0 transition-opacity group-hover:opacity-100">
            Bookmark selected text
          </span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          className="grid w-6 place-items-center rounded-sm bg-white/10 hover:bg-white/25"
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

        <span className="flex gap-1">
          Page
          <input
            type="text"
            className="w-[4ch] rounded bg-transparent text-center outline-none focus:bg-black/25"
            value={pageNumber}
            min={1}
            max={numPages}
            onChange={setPage}
          />
          of {numPages}
        </span>

        <button
          className="grid w-6 place-items-center rounded-sm bg-white/10 hover:bg-white/25"
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
