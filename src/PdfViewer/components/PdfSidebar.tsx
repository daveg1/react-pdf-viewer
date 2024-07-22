import "./PdfSidebar.css";
import { useContext } from "react";
import { Bookmark, BookmarkContext } from "../contexts/bookmark.context";
import { ScrollContext } from "../contexts/scroll.context";
import { LayoutContext } from "../contexts/layout.context";

export function PdfSidebar() {
  const { isSidebarOpen } = useContext(LayoutContext);
  const { bookmarks, removeBookmark } = useContext(BookmarkContext);
  const { virtualList, scrollToPage } = useContext(ScrollContext);

  /**
   * Make it easier to see which bookmark we're hovering over
   */
  function highlightBookmark(key: string) {
    const highlights = document.querySelectorAll(
      ".textLayer mark",
    ) as NodeListOf<HTMLElement>;

    highlights.forEach((el) => {
      if (el.id === key) {
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

  function groupBookmarks(bookmarks: Bookmark[]) {
    return bookmarks.reduce<Record<number, Bookmark[]>>((groups, bookmark) => {
      return {
        ...groups,
        [bookmark.pageIndex]: [...(groups[bookmark.pageIndex] ?? []), bookmark],
      };
    }, {});
  }

  return (
    <div
      rel={isSidebarOpen ? "open" : "closed"}
      className="Sidebar w-full max-w-sm select-none bg-gray-300 p-4"
    >
      <h3 className="mb-4 text-xl font-medium leading-tight">
        Bookmarked Phrases
      </h3>

      <div className="flex flex-col gap-4">
        {Object.entries(groupBookmarks(bookmarks)).map(
          ([pageIndex, bookmarks]) => (
            <section key={pageIndex}>
              <h3
                className="group flex cursor-pointer items-center gap-1 rounded-sm px-2 py-1 hover:bg-black/10"
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
                <article
                  key={bookmark.key}
                  className="flex cursor-pointer select-none items-center gap-2 rounded p-2 hover:bg-black/10"
                  onMouseOver={() => highlightBookmark(bookmark.key)}
                  onMouseLeave={() => resetHighlights()}
                >
                  <div className="flex w-full items-center gap-2">
                    <button
                      type="button"
                      onClick={() => removeBookmark(bookmark.key)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="group size-4 text-gray-500"
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
                    </button>

                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {bookmark.selectedText}
                    </span>

                    <button
                      className="ml-auto p-1 hover:bg-black/10"
                      type="button"
                      onClick={() => {
                        window.open(
                          `https://translate.google.co.uk/?sl=auto&tl=en&op=translate&text=${encodeURIComponent(bookmark.selectedText)}`,
                          "_blank",
                        );
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="size-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11 5a.75.75 0 0 1 .688.452l3.25 7.5a.75.75 0 1 1-1.376.596L12.89 12H9.109l-.67 1.548a.75.75 0 1 1-1.377-.596l3.25-7.5A.75.75 0 0 1 11 5Zm-1.24 5.5h2.48L11 7.636 9.76 10.5ZM5 1a.75.75 0 0 1 .75.75v1.261a25.27 25.27 0 0 1 2.598.211.75.75 0 1 1-.2 1.487c-.22-.03-.44-.056-.662-.08A12.939 12.939 0 0 1 5.92 8.058c.237.304.488.595.752.873a.75.75 0 0 1-1.086 1.035A13.075 13.075 0 0 1 5 9.307a13.068 13.068 0 0 1-2.841 2.546.75.75 0 0 1-.827-1.252A11.566 11.566 0 0 0 4.08 8.057a12.991 12.991 0 0 1-.554-.938.75.75 0 1 1 1.323-.707c.049.09.099.181.15.271.388-.68.708-1.405.952-2.164a23.941 23.941 0 0 0-4.1.19.75.75 0 0 1-.2-1.487c.853-.114 1.72-.185 2.598-.211V1.75A.75.75 0 0 1 5 1Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    <button
                      className="p-1 hover:bg-black/10"
                      type="button"
                      onClick={() =>
                        scrollToPage({
                          offset:
                            bookmark.scrollPercent * virtualList.getTotalSize(),
                        })
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="size-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.78 7.595a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06l2.72-2.72-2.72-2.72a.75.75 0 0 1 1.06-1.06l3.25 3.25Zm-8.25-3.25 3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06l2.72-2.72-2.72-2.72a.75.75 0 0 1 1.06-1.06Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </article>
              ))}
            </section>
          ),
        )}
      </div>

      {!bookmarks.length && <div className="p-2">No bookmarks yet</div>}
    </div>
  );
}
