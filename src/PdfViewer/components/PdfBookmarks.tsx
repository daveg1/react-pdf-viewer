import { useContext } from "react";
import { BookmarkContext } from "../contexts/bookmark.context";
import { ScrollContext } from "../contexts/virtual-scroll.context";
import { PdfContext } from "../contexts/pdf.context";

export function PdfBookmarks() {
  const { scrollToPage } = useContext(PdfContext);
  const { bookmarks } = useContext(BookmarkContext);
  const { virtualList } = useContext(ScrollContext);

  return (
    <div className="absolute left-12 top-16 z-50 w-full max-w-screen-sm rounded bg-zinc-200 p-4">
      <h3 className="mb-1 text-lg font-medium leading-tight">Bookmarks</h3>

      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.transformHash}
          className="cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap hover:underline"
          onClick={() =>
            scrollToPage(virtualList, { offset: bookmark.scrollOffset })
          }
        >
          [#{bookmark.pageIndex + 1}] {bookmark.selectedText}
        </div>
      ))}
    </div>
  );
}
