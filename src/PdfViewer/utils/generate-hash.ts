export function generateHash(pageIndex: number, numArray: number[]) {
  return `${pageIndex}${numArray.join("")}`;
}
