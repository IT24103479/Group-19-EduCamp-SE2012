import React, { useState, useEffect } from "react";
import type { ClassItem, Teacher, Subject } from "../../types";
import AddClassForm from "../../components/AddClassForm";
import EditClassForm from "../../components/admin/EditClassForm";
import ClassTable from "../../components/ClassTable";
import { toast } from "react-toastify";

const ClassRecords: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchSubjects();
  }, []);

  const normalizeArray = (data: any) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.classes)) return data.classes;
    // If single object returned, wrap it
    if (data && typeof data === "object") return [data];
    return [];
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch("http://localhost:8081/classes");
      const data = await res.json();
      const items = normalizeArray(data);
      const formatted = items.map((cls: any) => ({ ...cls, id: cls.id ?? cls.class_id }));
      setClasses(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch classes");
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch("http://localhost:8081/teachers");
      const data = await res.json();
      setTeachers(normalizeArray(data));
    } catch (err) {
      console.error(err);
      // optionally toast or leave silent
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch("http://localhost:8081/subjects");
      const data = await res.json();
      setSubjects(normalizeArray(data));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClassAdded = (newClass: ClassItem) =>
    setClasses((prev) => [...prev, { ...newClass, id: newClass.id ?? newClass.id }]);

  // Update existing class
  const handleClassUpdated = (updatedClass: ClassItem) => {
    // Update local state with the edited class
    setClasses((prev) => prev.map((cls) => (cls.id === updatedClass.id ? updatedClass : cls)));

    // Close the edit form
    setEditingClass(null);

    // Show success message
    toast.success("Class updated successfully! Please refresh the page to see changes.");
  };

  // Delete class
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;

    try {
      const res = await fetch(`http://localhost:8081/classes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete class");

      // Remove class from state immediately
      setClasses((prev) => prev.filter((cls) => cls.id !== id));

      // Show success toast
      toast.success("Class deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete class");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Class Records</h1>
      <AddClassForm onClassAdded={handleClassAdded} teachers={teachers} subjects={subjects} />
      {editingClass && (
        <EditClassForm
          classData={editingClass}
          classes={classes}
          onClassUpdated={handleClassUpdated}
          onCancel={() => setEditingClass(null)}
        />
      )}
      <ClassTable
        classes={classes}
        teachers={teachers}
        subjects={subjects}
        onDelete={handleDelete}
        onUpdate={handleClassUpdated}
      />
    </div>
  );
};

export default ClassRecords;