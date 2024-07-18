/**
 * Returns the text layer that a text item resides in. Assumes the input node is a textLayer item
 * @param node Anchor node from selection object
 * @returns
 */
export function findTextLayer(node: Node): HTMLElement {
  const parent = node.parentElement!.parentElement as HTMLElement;

  return parent!.classList.contains("markedContent")
    ? (parent.parentElement as HTMLElement)
    : parent;
}
