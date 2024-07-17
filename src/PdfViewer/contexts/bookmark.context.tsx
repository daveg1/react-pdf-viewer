import { TextContent } from "pdfjs-dist/types/src/display/api";
import React, { createContext, useState } from "react";

const LOCAL_STORAGE_KEY = "davepdf_bookmarks";

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
  const [bookmarks, _setBookmarks] = useState<Bookmark[]>(deserialise());
  const [textLayerCache, setTextLayerCache] = useState<
    Record<number, TextContent>
  >({});

  // Proxy to serialise the bookmarks whenever they'red changed
  function setBookmarks(
    value: Bookmark[] | ((prev: Bookmark[]) => Bookmark[]),
  ) {
    let newBookmarks: Bookmark[];

    if (Array.isArray(value)) {
      newBookmarks = value;
    } else {
      newBookmarks = value(bookmarks);
    }

    serialise(newBookmarks);
    _setBookmarks(newBookmarks);
  }

  const value = { bookmarks, setBookmarks, textLayerCache, setTextLayerCache };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}

function serialise(bookmarks: Bookmark[]) {
  const serial = JSON.stringify(bookmarks);
  window.localStorage.setItem(LOCAL_STORAGE_KEY, serial);
}

function deserialise() {
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  return JSON.parse(raw ?? "[]") as Bookmark[];
}
