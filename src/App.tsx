import "./App.css";
import { PdfViewer } from "./PdfViewer";

function App() {
  return (
    <>
      <PdfViewer options={{ cMapUrl: "/cmaps/" }} />
    </>
  );
}

export default App;
