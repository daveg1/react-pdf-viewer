import { TextItem } from "pdfjs-dist/types/src/display/api";
import { generateHash } from "./generate-hash";
import { Bookmark, TransformHash } from "../contexts/bookmark.context";

export type RenderProps = {
  pageIndex: number;
  pageNumber: number;
  itemIndex: number;
} & TextItem;

export function renderPdfText(props: RenderProps, bookmarks: Bookmark[]) {
  const hash = generateHash(props.pageIndex, props.transform);
  let bookmark: Bookmark | undefined;
  let transformHash: TransformHash | undefined;

  for (const book of bookmarks) {
    const transform = book.transformHashes.find((t) => t.hash === hash);

    if (transform) {
      bookmark = book;
      transformHash = transform;
      break;
    }
  }

  const text = props.str.trim();

  if (transformHash) {
    const startOffset = transformHash.startOffset ?? 0;
    const endOffset = transformHash.endOffset ?? text.length;
    const startSegment = text.slice(0, startOffset);
    const markedSegment = text.slice(startOffset, endOffset);
    const endSegment = text.slice(endOffset);

    return `${startSegment}<mark id="${bookmark?.key}" class="text-transparent bg-yellow-300/50">${markedSegment}</mark>${endSegment}`;
  }

  return text;
}
