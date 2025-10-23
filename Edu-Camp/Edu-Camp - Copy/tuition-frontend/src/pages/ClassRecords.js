// src/pages/ClassRecords.js
import React, { useState, useEffect } from "react";
import AddClassForm from "../components/AddClassForm";
import ClassTable from "../components/ClassTable";

function ClassRecords() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/classes")
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(err => console.error(err));
  }, []);

  const handleClassAdded = (newClass) => {
    // Prevent duplicates: same grade + teacher + same subject
    const exists = classes.some(c =>
      c.grade === newClass.grade &&
      c.teacher.id === newClass.teacher.id &&
      JSON.stringify(c.subjects.map(s => s.id)) === JSON.stringify(newClass.subjects.map(s => s.id))
    );

    if (exists) {
      alert("This class already exists!");
      return;
    }

    setClasses(prev => [...prev, newClass]);
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:8080/classes/${id}`, { method: "DELETE" })
      .then(() => setClasses(prev => prev.filter(c => c.class_id !== id)))
      .catch(err => console.error(err));
  };

  const handleEdit = (cls) => {
    alert("Edit functionality not implemented yet");
  };

  return (
    <div className="p-4">
      <AddClassForm onClassAdded={handleClassAdded} />
      <ClassTable classes={classes} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}

export default ClassRecords;
