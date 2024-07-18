import { VIEWPORT_HEIGHT } from "../constants/pdf.constants";
import { Loader } from "./Loader";

export function PdfLoadingState() {
  return (
    <div
      className="flex w-lvw justify-center py-20"
      style={{ height: `${VIEWPORT_HEIGHT}px` }}
    >
      <Loader />
    </div>
  );
}
