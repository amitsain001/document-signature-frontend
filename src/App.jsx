import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DocumentViewer from "./pages/DocumentViewer";
import Login from "./pages/Login";
import PublicSign from "./pages/PublicSign";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/document/:id" element={<DocumentViewer />} />
        <Route path="/sign/:token" element={<PublicSign />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;