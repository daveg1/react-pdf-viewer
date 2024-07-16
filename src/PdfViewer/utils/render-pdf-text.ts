import { TextItem } from "pdfjs-dist/types/src/display/api";
import { generateHash } from "./generate-hash";
import { Bookmark } from "../contexts/bookmark.context";

export type RenderProps = {
  pageIndex: number;
  pageNumber: number;
  itemIndex: number;
} & TextItem;

export function renderPdfText(props: RenderProps, bookmarks: Bookmark[]) {
  const hash = generateHash(props.pageIndex, props.transform);
  const hasHash = bookmarks.find((bookmark) => bookmark.transformHash === hash);
  const text = props.str.trim();

  if (hasHash) {
    return `<mark>${text}</mark>`;
  }

  return text;
}
