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
   * The whole selection text
   */
  selectedText: string;

  /**
   * The percentage scroll offset of the start of the selection text.
   *
   * A percentage value is more resilient to scale changes, as opposed to the exact scrollOffset value
   */
  scrollPercent: number;

  /**
   * The page on which the starting container of the selection appears
   */
  pageIndex: number;

  /**
   * Used by the textLayerReneder to determine which text nodes to highlight
   */
  transformHashes: TransformHash[];
}

interface BookmarkContext {
  /**
   * The list of bookmarks
   */
  bookmarks: Bookmark[];

  /**
   * Add a single bookmark to state
   * @param bookmark The bookmark to add
   * @returns void
   */
  addBookmark: (bookmark: Bookmark) => void;

  /**
   * Remove a single bookmark from state based on its unique key
   * @param key The UUID of the bookmark
   * @returns void
   */
  removeBookmark: (key: string) => void;

  /**
   * A cache of the text layers generated by the current PDF, indexed by the pageIndex
   */
  textLayerCache: Record<number, TextContent>;

  /**
   * State setter for the text layer cache
   */
  setTextLayerCache: React.Dispatch<
    React.SetStateAction<Record<number, TextContent>>
  >;
}

/**
 * The serialised content stored in localStorage, indexed by the PDF fingerprint
 */
type BookmarksSerial = {
  [Fingerprint: string]: Bookmark[];
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
