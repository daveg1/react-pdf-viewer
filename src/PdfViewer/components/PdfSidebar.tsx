import "./PdfSidebar.css";
import { useContext } from "react";
import { BookmarkContext } from "../contexts/bookmark.context";
import { ScrollContext } from "../contexts/virtual-scroll.context";
import { PdfContext } from "../contexts/pdf.context";

export function PdfSidebar() {
  const { isSidebarOpen, scrollToPage } = useContext(PdfContext);
  const { bookmarks } = useContext(BookmarkContext);
  const { virtualList } = useContext(ScrollContext);

  // TODO: group bookmarks by pageIndex and indent them

  /**
   * Make it easier to see which bookmark we're hovering over
   */
  function isolateHighlight(key: string) {
    const highlights = document.querySelectorAll(
      ".textLayer mark",
    ) as NodeListOf<HTMLElement>;

    highlights.forEach((el) => {
      el.className = "text-transparent";

      if (el.id !== key) {
        el.classList.add("bg-gray-400/50");
      } else {
        el.classList.add("bg-yellow-300/50");
      }
    });
  }

  function resetHighlights() {
    const highlights = document.querySelectorAll(
      ".textLayer mark",
    ) as NodeListOf<HTMLElement>;

    highlights.forEach(
      (el) => (el.className = "text-transparent bg-yellow-300/50"),
    );
  }

  return (
    <div
      rel={isSidebarOpen ? "open" : "closed"}
      className="Sidebar w-[380px] bg-gray-300 p-4"
    >
      <h3 className="mb-1 text-xl font-medium leading-tight">Bookmarks</h3>

      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.key}
          className="w-[calc(380px_-_2rem)] cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap rounded-sm p-2 hover:bg-black/10"
          onClick={() =>
            scrollToPage(virtualList, { offset: bookmark.scrollOffset })
          }
          onMouseOver={() => isolateHighlight(bookmark.key)}
          onMouseLeave={() => resetHighlights()}
        >
          [#{bookmark.pageIndex + 1}] {bookmark.selectedText}
        </div>
      ))}

      {!bookmarks.length && <div className="p-2">No bookmarks yet</div>}
    </div>
  );
}
