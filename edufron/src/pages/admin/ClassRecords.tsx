import React, { useState, useEffect } from "react";
import AddClassForm from "../../components/admin/AddClassForm";
import ClassTable from "../../components/ui/ClassTable";
import type { ClassItem } from "./Classes"; // import the type

const ClassRecords: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);

  // Fetch classes from backend
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("http://localhost:8080/classes");
        const data: ClassItem[] = await res.json();
        setClasses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  // Add new class
  const handleClassAdded = (newClass: ClassItem) => {
    const exists = classes.some(
      (c) =>
        c.grade === newClass.grade &&
        c.teacher.id === newClass.teacher.id &&
        JSON.stringify(c.subjects.map((s) => s.id)) ===
          JSON.stringify(newClass.subjects.map((s) => s.id))
    );

    if (exists) {
      alert("This class already exists!");
      return;
    }

    setClasses((prev) => [...prev, newClass]);
  };

  // Delete a class
  const handleDelete = (id: number) => {
    fetch(`http://localhost:8080/classes/${id}`, { method: "DELETE" })
      .then(() => setClasses((prev) => prev.filter((c) => c.id !== id)))
      .catch((err) => console.error(err));
  };

  // Edit class (placeholder)
  const handleEdit = (cls: ClassItem) => {
    alert("Edit functionality not implemented yet");
  };

  return (
    <div className="p-4">
      <AddClassForm onClassAdded={handleClassAdded} />
      <ClassTable classes={classes} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default ClassRecords