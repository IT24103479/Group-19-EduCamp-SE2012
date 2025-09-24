import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ClassRecords from "./pages/ClassRecords";

function App() {
  return (
    <Router>
      <nav className="bg-gray-800 p-4 text-white">
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/classes">Classes</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h1 className="p-6 text-xl">Welcome to Edu Camp</h1>} />
        <Route path="/classes" element={<ClassRecords />} />
      </Routes>
    </Router>
  );
}

export default App;
