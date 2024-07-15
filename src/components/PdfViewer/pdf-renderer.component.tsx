interface Props {
  pageIndex: number;
  pageNumber: number;
  itemIndex: number;
  str: string;
  dir: string;
  transform: Array<number>;
  width: number;
  height: number;
  fontName: string;
  hasEOL: boolean;
}

export function PdfRenderer(props: Props) {
  return props.str.trim();
}
