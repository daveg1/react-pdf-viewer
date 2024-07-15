import { useContext } from "react";
import { PdfContext } from "../PdfViewer";

export function PdfViewerMenu() {
  const { numPages, pageNumber, scrollToPage } = useContext(PdfContext);

  const MIN_PAGE = 1;
  const MAX_PAGE = numPages;

  function pageBackward() {
    const pageNum = Math.max(pageNumber - 1, MIN_PAGE);
    scrollToPage(pageNum);
  }

  function pageForward() {
    const pageNum = Math.min(pageNumber + 1, MAX_PAGE);
    scrollToPage(pageNum);
  }

  function setPage(e: React.ChangeEvent<HTMLInputElement>) {
    const value = +e.target.value || 1;
    if (value > numPages) return;
    scrollToPage(value);
  }

  return (
    <div className="sticky inset-x-0 top-0 z-50 flex justify-center gap-4 bg-zinc-700 py-2 text-white shadow-lg">
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

      <span>
        Page
        <input
          type="text"
          className="w-[5ch] bg-transparent text-center"
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
  );
}
