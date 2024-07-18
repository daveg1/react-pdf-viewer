import { VIEWPORT_HEIGHT } from "../constants/pdf.constants";

export function PdfEmptyState() {
  function openFile() {
    (document.querySelector("input[type=file]") as HTMLElement)?.click();
  }

  return (
    <div className="w-lvw py-20" style={{ height: `${VIEWPORT_HEIGHT}px` }}>
      <div className="mx-auto flex w-full max-w-md items-center justify-between rounded bg-white p-4">
        <span>No PDF loaded.</span>
        <button
          className="rounded bg-black/10 p-2 hover:bg-black/20"
          onClick={openFile}
        >
          Upload a file
        </button>
      </div>
    </div>
  );
}
