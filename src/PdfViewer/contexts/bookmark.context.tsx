import { TextContent } from "pdfjs-dist/types/src/display/api";
import React, { createContext, useContext, useEffect, useState } from "react";
import { PdfContext } from "./pdf.context";
import { deserialise, serialise } from "../utils/local-storage";

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

interface BookmarkContext {
  bookmarks: Bookmark[];
  addBookmark: (value: Bookmark) => void;
  removeBookmark: (key: string) => void;
  textLayerCache: Record<number, TextContent>;
  setTextLayerCache: React.Dispatch<
    React.SetStateAction<Record<number, TextContent>>
  >;
}

type BookmarksSerial = {
  [Key: string]: Bookmark[];
};

export const BookmarkContext = createContext<BookmarkContext>(null!);

export function BookmarkContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [serial, setSerial] = useState<BookmarksSerial>(
    deserialise<BookmarksSerial>(LOCAL_STORAGE_KEY),
  );
  const { fingerprint } = useContext(PdfContext);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(
    serial[fingerprint] ?? [],
  );
  const [textLayerCache, setTextLayerCache] = useState<
    Record<number, TextContent>
  >({});

  useEffect(() => {
    setBookmarks(serial[fingerprint] ?? []);
  }, [fingerprint, serial]);

  function updateSerial(newBookmarks: Bookmark[]) {
    const newSerial = { ...serial, [fingerprint]: newBookmarks };

    setSerial(newSerial);
    serialise<BookmarksSerial>(LOCAL_STORAGE_KEY, newSerial);
  }

  function addBookmark(value: Bookmark) {
    const newBookmarks = [...bookmarks, value];

    setBookmarks(newBookmarks);
    updateSerial(newBookmarks);
  }

  function removeBookmark(key: string) {
    const newBookmarks = [...bookmarks];
    const idx = bookmarks.findIndex((v) => v.key === key);
    newBookmarks.splice(idx, 1);

    setBookmarks(newBookmarks);
    updateSerial(newBookmarks);
  }

  const value: BookmarkContext = {
    bookmarks,
    addBookmark,
    removeBookmark,
    textLayerCache,
    setTextLayerCache,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}
