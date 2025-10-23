// src/components/NavBar.js
import React from "react";
import { Link } from "react-router-dom"; // if using React Router

function NavBar() {
  return (
    <nav className="bg-blue-500 p-4 text-white flex justify-around">
      <Link to="/">Home</Link>
      <Link to="/browse-classes">Browse Classes</Link>
      <Link to="/class-details">Class Details</Link>
      <Link to="/class-records">Admin Records</Link>
    </nav>
  );
}

export default NavBar;
