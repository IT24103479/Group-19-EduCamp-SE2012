
import './App.css';
import React, { useState } from "react";
import TeacherPage from "./pages/TeacherPage.jsx";
import AdminTeacherPage from "./pages/AdminTeacherPage";

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>
        <strong style={{ color: "Purple" }}>Welcome to Edu-Camp</strong>
      </h1>

      {/* Navigation Buttons */}
      <div style={{ margin: "20px" }}>
        <button onClick={() => setShowAdmin(false)}>Teacher Page</button>
        <button onClick={() => setShowAdmin(true)}>Admin Page</button>
      </div>

      {/* Page Content */}
      {showAdmin ? <AdminTeacherPage /> : <TeacherPage />}
    </div>
  );
}

export default App;



