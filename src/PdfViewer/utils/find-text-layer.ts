/**
 * Returns the text layer that a text item resides in. Assumes the input node is a textLayer item
 * @param node Anchor node from selection object
 * @returns
 */
export function findTextLayer(node: Node): HTMLElement | null {
  return node.parentElement?.closest(".react-pdf__Page__textContent") ?? null;
}
