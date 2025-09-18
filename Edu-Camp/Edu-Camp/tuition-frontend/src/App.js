import React from "react";
import ClassList from "./pages/ClassList"; // ✅ must match your export
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Tuition Classes</h1>
      <ClassList />
    </div>
  );
}

export default App;
