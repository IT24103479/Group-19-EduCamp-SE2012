import React, { useState, useEffect } from "react";
import type { ClassItem, Teacher, Subject } from "../../types";
import AddClassForm from "../../components/AddClassForm";
import EditClassForm from "../../components/admin/EditClassForm";
import ClassTable from "../../components/ClassTable";
import { toast } from "react-toastify";

const ClassRecords: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
    fetchClasses();
  }, []);

  const normalizeArray = (data: any) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.classes)) return data.classes;
    if (data && typeof data === "object") return [data];
    return [];
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch("http://localhost:8081/classes");
      const data = await res.json();
      console.log("Classes loaded:", data);
      const items = normalizeArray(data);
      // Backend currently returns a DTO with fields like class_id, teacher_id, teacher_name, subjectIds, subjectNames
      const formatted = items.map((it: any) => ({
        // canonical id & name
        id: it.id ?? it.class_id ?? it.classId,
        name: it.name ?? it.className ?? it.title,
        // teacher info (backend sends teacher_id and teacher_name in DTO)
        teacherId: it.teacher_id ?? it.teacherId ?? (it.teacher && it.teacher.id) ?? null,
        teacherName: it.teacher_name ?? it.teacherName ?? (it.teacher && `${it.teacher.firstName ?? ""} ${it.teacher.lastName ?? ""}`.trim()) ?? "",
        // subjects as ids and names arrays (DTO provides subjectIds & subjectNames)
        subjectIds: it.subjectIds ?? it.subjectIds ?? (it.subjects ? it.subjects.map((s: any) => s.id) : []),
        subjectNames: it.subjectNames ?? it.subjectNames ?? (it.subjects ? it.subjects.map((s: any) => s.name) : []),
        // keep raw item for other fields (grade, fee, timetable, etc.)
        raw: it,
      }));
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
      console.log("Teachers loaded:", data);
      setTeachers(normalizeArray(data));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch("http://localhost:8081/subjects");
      const data = await res.json();
      console.log("Subjects loaded:", data);
      setSubjects(normalizeArray(data));
    } catch (err) {
      console.error(err);
    }
  };

  // When a class is added via AddClassForm, refresh the list from backend so DTO fields (subjectNames, teacher_name) are present
  const handleClassAdded = async () => {
    await fetchClasses();
    toast.success("Class added");
  };

  // When class updated, refresh list (so the table shows teacher_name / subjectNames returned by backend DTO)
  const handleClassUpdated = async () => {
    await fetchClasses();
    setEditingClass(null);
    toast.success("Class updated");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      const res = await fetch(`http://localhost:8081/classes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete class");
      // refresh list
      await fetchClasses();
      toast.success("Class deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete class");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Class Records</h1>

      <AddClassForm
        teachers={teachers}
        subjects={subjects}
        onClassAdded={() => handleClassAdded()}
      />

      {editingClass && (
        <EditClassForm
          classData={editingClass}
          teachers={teachers}
          subjects={subjects}
          onClassUpdated={() => handleClassUpdated()}
          onCancel={() => setEditingClass(null)}
        />
      )}

      <ClassTable
        classes={classes}
        teachers={teachers}
        subjects={subjects}
        onDelete={handleDelete}
        onEdit={(c) => {
          // pass the raw DTO back into edit form so it can initialize properly
          // find original class raw item if present
          const found = classes.find((x) => x.id === c.id);
          setEditingClass(found ? found.raw : c.raw ?? c);
        }}
      />
    </div>
  );
};

export default ClassRecords;