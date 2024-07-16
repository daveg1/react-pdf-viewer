import "./PdfSidebar.css";
import { useContext } from "react";
import { BookmarkContext } from "../contexts/bookmark.context";
import { ScrollContext } from "../contexts/virtual-scroll.context";
import { PdfContext } from "../contexts/pdf.context";

export function PdfSidebar() {
  const { isSidebarOpen, scrollToPage } = useContext(PdfContext);
  const { bookmarks } = useContext(BookmarkContext);
  const { virtualList } = useContext(ScrollContext);

  return (
    <div
      rel={isSidebarOpen ? "open" : "closed"}
      className="Sidebar w-full basis-2/6 bg-gray-300 p-4"
    >
      <h3 className="mb-1 text-xl font-medium leading-tight">Bookmarks</h3>

      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.transformHash}
          className="cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap rounded-sm p-2 hover:bg-black/10"
          onClick={() =>
            scrollToPage(virtualList, {
              offset: bookmark.scrollOffset,
              scrollBehaviour: "smooth",
            })
          }
        >
          [#{bookmark.pageIndex + 1}] {bookmark.selectedText}
        </div>
      ))}

      {!bookmarks.length && <div className="p-2">No bookmarks yet</div>}
    </div>
  );
}
