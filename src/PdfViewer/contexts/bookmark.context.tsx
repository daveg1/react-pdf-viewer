import { TextContent } from "pdfjs-dist/types/src/display/api";
import React, { createContext, useState } from "react";

export interface TransformHash {
  hash: string;
  startOffset?: number;
  endOffset?: number;
}

export interface Bookmark {
  /**
   * Random UUID
   */
  key: string;

  /**
   * The selection text the bookmark is created on.
   */
  selectedText: string;

  /**
   * The absolute scrollOffset from the start of the pdf document to the start of the anchoring node
   */
  scrollOffset: number;

  /**
   * The page on which this bookmark appears
   */
  pageIndex: number;

  /**
   * Used by the textLayerReneder to determine which text nodes to highlight
   */
  transformHashes: TransformHash[];
}

interface IBookmarkContext {
  bookmarks: Bookmark[];
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
  textLayerCache: Record<number, TextContent>;
  setTextLayerCache: React.Dispatch<
    React.SetStateAction<Record<number, TextContent>>
  >;
}

export const BookmarkContext = createContext<IBookmarkContext>(null!);

export function BookmarkContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [textLayerCache, setTextLayerCache] = useState<
    Record<number, TextContent>
  >({});

  const value = { bookmarks, setBookmarks, textLayerCache, setTextLayerCache };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}
