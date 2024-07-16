import { TextContent } from "pdfjs-dist/types/src/display/api";
import React, { createContext, useState } from "react";

interface Bookmark {
  transformHash: string;
  text: string;
  pageIndex: number;
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
