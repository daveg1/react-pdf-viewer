import "./App.css";
import { PdfViewer } from "./components";

function App() {
  return (
    <>
      <PdfViewer options={{ cMapUrl: "/cmaps/" }} />
    </>
  );
}

export default App;
