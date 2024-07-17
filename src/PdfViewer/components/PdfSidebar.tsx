import "./PdfSidebar.css";
import { useContext } from "react";
import { Bookmark, BookmarkContext } from "../contexts/bookmark.context";
import { ScrollContext } from "../contexts/scroll.context";
import { LayoutContext } from "../contexts/layout.context";

export function PdfSidebar() {
  const { isSidebarOpen } = useContext(LayoutContext);
  const { bookmarks, setBookmarks } = useContext(BookmarkContext);
  const { scrollToPage } = useContext(ScrollContext);

  /**
   * Make it easier to see which bookmark we're hovering over
   */
  function highlightBookmark(key: string) {
    const highlights = document.querySelectorAll(
      ".textLayer mark",
    ) as NodeListOf<HTMLElement>;

    highlights.forEach((el) => {
      // el.className = "text-transparent bg-yellow-300/50";

      if (el.id === key) {
        el.classList.add("ring-2", "ring-black", "bg-blue-300/50");
      } else {
        el.classList.remove("ring-2", "ring-black", "bg-blue-300/50");
      }
    });
  }

  function resetHighlights() {
    const highlights = document.querySelectorAll(
      ".textLayer mark",
    ) as NodeListOf<HTMLElement>;

    highlights.forEach((el) =>
      el.classList.remove("ring-2", "ring-black", "bg-blue-300/50"),
    );
  }

  function groupBookmarks(bookmarks: Bookmark[]) {
    return bookmarks.reduce<Record<number, Bookmark[]>>((groups, bookmark) => {
      return {
        ...groups,
        [bookmark.pageIndex]: [...(groups[bookmark.pageIndex] ?? []), bookmark],
      };
    }, {});
  }

  function removeBookmark(key: string) {
    setBookmarks((values) => {
      const idx = values.findIndex((v) => v.key === key);
      const newValues = [...values];
      newValues.splice(idx, 1);
      return newValues;
    });
  }

  return (
    <div
      rel={isSidebarOpen ? "open" : "closed"}
      className="Sidebar w-full max-w-md select-none bg-gray-300 p-4"
    >
      <h3 className="mb-4 text-xl font-medium leading-tight">Bookmarks</h3>

      <div className="flex flex-col gap-4">
        {Object.entries(groupBookmarks(bookmarks)).map(
          ([pageIndex, bookmarks]) => (
            <section key={pageIndex}>
              <h3
                className="group flex cursor-pointer items-center gap-1 rounded-sm px-1 hover:bg-black/10"
                onClick={() =>
                  scrollToPage({
                    pageNumber: +pageIndex + 1,
                    scrollBehaviour: "smooth",
                  })
                }
              >
                <span>Page {+pageIndex + 1}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="mt-0.5 size-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.78 7.595a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06l2.72-2.72-2.72-2.72a.75.75 0 0 1 1.06-1.06l3.25 3.25Zm-8.25-3.25 3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06l2.72-2.72-2.72-2.72a.75.75 0 0 1 1.06-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </h3>

              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.key}
                  className="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1 hover:bg-black/10"
                  onMouseOver={() => highlightBookmark(bookmark.key)}
                  onMouseLeave={() => resetHighlights()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="group size-4 text-gray-500"
                    onClick={() => removeBookmark(bookmark.key)}
                  >
                    <path
                      className="group-hover:hidden"
                      d="M3.75 2a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 1.28.53L8 10.06l3.72 3.72a.75.75 0 0 0 1.28-.53V2.75a.75.75 0 0 0-.75-.75h-8.5Z"
                    />

                    <path
                      className="hidden group-hover:block group-hover:text-gray-900"
                      d="M13 2.75v7.775L4.475 2h7.775a.75.75 0 0 1 .75.75ZM3 13.25V5.475l4.793 4.793L4.28 13.78A.75.75 0 0 1 3 13.25ZM2.22 2.22a.75.75 0 0 1 1.06 0l10.5 10.5a.75.75 0 1 1-1.06 1.06L2.22 3.28a.75.75 0 0 1 0-1.06Z"
                    />
                  </svg>

                  <span
                    className="-my-1 -mr-2 w-full max-w-sm overflow-hidden text-ellipsis whitespace-nowrap py-1 pr-2"
                    onClick={() =>
                      scrollToPage({ offset: bookmark.scrollOffset })
                    }
                  >
                    {bookmark.selectedText}
                  </span>
                </div>
              ))}
            </section>
          ),
        )}
      </div>

      {!bookmarks.length && <div className="p-2">No bookmarks yet</div>}
    </div>
  );
}
