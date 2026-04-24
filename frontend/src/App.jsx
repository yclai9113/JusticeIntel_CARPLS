// Defines routing and top-level navigation.

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Layout from "./components/Layout";
import ChatPage from "./pages/ChatPage";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import UploadPage from "./pages/Upload";
import UpdatePage from "./pages/Updates";

function App() {
  return (
    <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<ChatPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/update" element={<UpdatePage />} />
          </Route>
        </Routes>
    </Router>
  );
}

export default App;