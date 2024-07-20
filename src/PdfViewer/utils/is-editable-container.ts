export function isEditableContainer(element?: EventTarget | null) {
  return (
    element &&
    (element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement ||
      (element as HTMLElement).isContentEditable)
  );
}
