import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DocumentViewer from "./pages/DocumentViewer";
import Login from "./pages/Login";
import PublicSign from "./pages/PublicSign";
import { Toaster } from "react-hot-toast";
import Register from "./pages/Register";

function App() {
  return (

    <>
      <Toaster position="top-right" />
      {/* your routes */}

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/document/:id" element={<DocumentViewer />} />
          <Route path="/sign/:token" element={<PublicSign />} />
          
        </Routes>
      </BrowserRouter>

    </>
  );
}

export default App;