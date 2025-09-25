import React, { useState, useEffect } from "react";
import axios from "axios";
import ClassCard from "../components/ClassCard";
import { useNavigate } from "react-router-dom";

function BrowseClassesPage() {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8080/classes")
      .then((res) => setClasses(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleCardClick = (id) => {
    navigate(`/classes/${id}`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Browse Classes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <ClassCard
            key={cls.class_id}
            cls={cls}
            onClick={() => handleCardClick(cls.class_id)}
          />
        ))}
      </div>
    </div>
  );
}

export default BrowseClassesPage;
