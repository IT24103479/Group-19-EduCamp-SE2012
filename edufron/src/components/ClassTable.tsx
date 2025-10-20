import React, { useState } from "react";
import type { ClassItem, Teacher, Subject } from "../types";

interface ClassTableProps {
  classes: ClassItem[];
  teachers: Teacher[];
  subjects: Subject[];
  onDelete: (id: number) => void;
  onUpdate: (updatedClass: ClassItem) => void;
}

const ClassTable: React.FC<ClassTableProps> = ({
  classes,
  teachers,
  subjects,
  onDelete,
  onUpdate,
}) => {
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [editedGrade, setEditedGrade] = useState("");
  const [editedFee, setEditedFee] = useState("");
  const [editedTimetable, setEditedTimetable] = useState("");
  const [editedTeacherId, setEditedTeacherId] = useState<number | "">("");
  const [editedSubjectId, setEditedSubjectId] = useState<number | "">("");

  const startEditing = (cls: ClassItem) => {
    setEditingClassId(cls.id);
    setEditedGrade(cls.grade);
    setEditedFee(cls.fee.toString());
    setEditedTimetable(cls.timetable);
    setEditedTeacherId(cls.teacher?.id || "");
    setEditedSubjectId(cls.subjects?.[0]?.id || "");
  };

  const cancelEditing = () => setEditingClassId(null);

  const saveEdit = async (cls: ClassItem) => {
    const updatedClass = {
      ...cls,
      grade: editedGrade,
      fee: parseFloat(editedFee),
      timetable: editedTimetable,
      teacher: teachers.find(t => t.id === editedTeacherId),
      subjects: editedSubjectId ? [{ id: editedSubjectId, name: subjects.find(s => s.id === editedSubjectId)?.name || "" }] : [],
    };

    try {
      const res = await fetch(`http://localhost:8080/classes/${cls.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedClass),
      });
      if (!res.ok) throw new Error("Failed to update class");
      const data = await res.json();
      onUpdate(data);
      setEditingClassId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update class");
    }
  };

  if (!classes.length) return <p>No classes found.</p>;

  return (
    <table className="min-w-full bg-white border rounded overflow-hidden mt-4">
      <thead className="bg-gray-100">
        <tr>
          <th>Grade</th>
          <th>Fee</th>
          <th>Teacher</th>
          <th>Subjects</th>
          <th>Timetable</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {classes.map(cls => (
          <tr key={cls.id ?? cls.grade + cls.timetable}>
            {editingClassId === cls.id ? (
              <>
                <td><input value={editedGrade} onChange={e => setEditedGrade(e.target.value)} className="w-full px-2 py-1 border rounded bg-white"/></td>
                <td><input type="number" value={editedFee} onChange={e => setEditedFee(e.target.value)} className="w-full px-2 py-1 border rounded bg-white"/></td>
                <td>
                  <select value={editedTeacherId} onChange={e => setEditedTeacherId(Number(e.target.value))} className="w-full px-2 py-1 border rounded bg-white">
                    <option value="">-- Select Teacher --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </td>
                <td>
                  <select value={editedSubjectId} onChange={e => setEditedSubjectId(Number(e.target.value))} className="w-full px-2 py-1 border rounded bg-white">
                    <option value="">-- Select Subject --</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </td>
                <td><input value={editedTimetable} onChange={e => setEditedTimetable(e.target.value)} className="w-full px-2 py-1 border rounded bg-white"/></td>
                <td className="flex gap-2">
                  <button onClick={() => saveEdit(cls)} className="bg-green-600 text-white px-2 py-1 rounded">Save</button>
                  <button onClick={cancelEditing} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
                </td>
              </>
            ) : (
              <>
                <td>{cls.grade}</td>
                <td>{cls.fee}</td>
                <td>{cls.teacher?.name || "No teacher"}</td>
                <td>{cls.subjects.map(s => s.name).join(", ") || "No subjects"}</td>
                <td>{cls.timetable}</td>
                <td className="flex gap-2">
                  <button onClick={() => startEditing(cls)} className="bg-blue-600 text-white px-2 py-1 rounded">Edit</button>
                  <button onClick={() => onDelete(cls.id!)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ClassTable;
