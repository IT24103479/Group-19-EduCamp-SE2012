// src/pages/ClassList.js
import React, { useState, useEffect } from "react";
import ClassCard from "../components/ClassCard";
import SearchBar from "../components/SearchBar";

const ClassList = () => {
  const [classes, setClasses] = useState([]);

  // Function to fetch classes from backend
  const fetchClasses = async (subject = "") => {
    try {
      let url = "http://localhost:8080/classes";
      if (subject) {
        url += `/search?subject=${encodeURIComponent(subject)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      setClasses([]); // clear the list on error
    }
  };

  // Fetch all classes when component mounts
  useEffect(() => {
    fetchClasses();
  }, []);

  // Handle click on a class card
  const handleCardClick = (cls) => {
    console.log("Clicked class:", cls);
    // You can navigate to a detail page if needed
  };

  return (
    <div>
      {/* Search bar triggers fetchClasses */}
      <SearchBar onSearch={fetchClasses} />

      {/* Display class cards */}
      <div className="class-list">
        {classes.length === 0 ? (
          <p>No classes found.</p>
        ) : (
          classes.map((cls) => (
            <ClassCard
              key={cls.id}
              classData={cls}
              onClick={() => handleCardClick(cls)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ClassList;
