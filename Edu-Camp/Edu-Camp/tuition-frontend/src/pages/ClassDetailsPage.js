import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ClassRecordsPage from "./pages/ClassRecordsPage";      // Admin-only
import BrowseClassesPage from "./pages/BrowseClassesPage";    // Public
import ClassDetailsPage from "./pages/ClassDetailsPage";      // Public, card click details

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin page */}
        <Route path="/admin/classes" element={<ClassRecordsPage />} />

        {/* Browse classes page */}
        <Route path="/classes" element={<BrowseClassesPage />} />

        {/* Class details page */}
        <Route path="/classes/:id" element={<ClassDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
