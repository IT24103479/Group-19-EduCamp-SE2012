import React, { useState } from "react";
import type { ClassItem, Teacher, Subject } from "../types";
import { toast } from "react-toastify";

interface AddClassFormProps {
  onClassAdded: (newClass: ClassItem) => void;
  teachers: Teacher[];
  subjects: Subject[];
}

const AddClassForm: React.FC<AddClassFormProps> = ({ onClassAdded, teachers, subjects }) => {
  const [grade, setGrade] = useState("");
  const [fee, setFee] = useState("");
  const [timetable, setTimetable] = useState("");
  const [teacherId, setTeacherId] = useState<number | "">("");
  const [subjectId, setSubjectId] = useState<number | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || !subjectId) { toast.error("Select teacher & subject"); return; }

    const payload: any = {
      grade,
      fee: parseFloat(fee),
      timetable,
      teacher_id: teacherId,
      subjects: [{ id: subjectId }],
    };

    try {
      const res = await fetch("http://localhost:8080/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add class");
      const data = await res.json();
      onClassAdded(data);

      setGrade(""); setFee(""); setTimetable(""); setTeacherId(""); setSubjectId("");
      toast.success("Class added!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add class");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded bg-gray-50 mb-4">
      <h2 className="text-lg font-bold mb-4">Add Class</h2>
      <div className="mb-2"><input placeholder="Grade" value={grade} onChange={e => setGrade(e.target.value)} required className="w-full px-2 py-1 border rounded bg-white"/></div>
      <div className="mb-2"><input type="number" placeholder="Fee" value={fee} onChange={e => setFee(e.target.value)} required className="w-full px-2 py-1 border rounded bg-white"/></div>
      <div className="mb-2"><input placeholder="Timetable" value={timetable} onChange={e => setTimetable(e.target.value)} required className="w-full px-2 py-1 border rounded bg-white"/></div>
      <div className="mb-2">
        <select value={teacherId} onChange={e => setTeacherId(Number(e.target.value))} className="w-full px-2 py-1 border rounded bg-white">
          <option value="">-- Select Teacher --</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="mb-4">
        <select value={subjectId} onChange={e => setSubjectId(Number(e.target.value))} className="w-full px-2 py-1 border rounded bg-white">
          <option value="">-- Select Subject --</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Add Class</button>
    </form>
  );
};

export default AddClassForm;