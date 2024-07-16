import "./App.css";
import { PdfViewer } from "./PdfViewer";

function App() {
  return (
    <>
      <PdfViewer file="/russian.pdf" options={{ cMapUrl: "/cmaps/" }} />
    </>
  );
}

export default App;
