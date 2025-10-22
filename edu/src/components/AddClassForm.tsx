import React, { useState } from "react";
import type { ClassItem, Teacher, Subject } from "../../types";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherId === "" || subjectId === "") return;

    const teacher = teachers.find((t) => t.id === teacherId);
    const subject = subjects.find((s) => s.id === subjectId);

    if (!teacher || !subject) {
      console.error("Selected teacher or subject not found");
      return;
    }

    const newClass: ClassItem = {
      id: Date.now(), // temporary; backend should return real id
      grade,
      fee: parseFloat(fee),
      timetable,
      teacher,
      subjects: [subject],
    };

    fetch("http://localhost:8081/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClass),
    })
      .then((res) => res.json())
      .then((data) => {
        // Backend might return the created object directly or wrapped; prefer the returned value
        const created = data && data.id ? data : newClass;
        onClassAdded(created);
        setGrade("");
        setFee("");
        setTimetable("");
        setTeacherId("");
        setSubjectId("");
      })
      .catch((err) => console.error(err));
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded bg-gray-50 mb-4">
      <h2 className="text-lg font-bold mb-4">Add New Class</h2>

      <div className="mb-2">
        <label>Grade:</label>
        <input
          type="text"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
          required
        />
      </div>

      <div className="mb-2">
        <label>Fee:</label>
        <input
          type="number"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
          required
        />
      </div>

      <div className="mb-2">
        <label>Timetable:</label>
        <input
          type="text"
          value={timetable}
          onChange={(e) => setTimetable(e.target.value)}
          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
          required
        />
      </div>

      <div className="mb-2">
        <label>Teacher:</label>
        <select
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
          required
        >
          <option value="">-- Select Teacher --</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label>Subject:</label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
          required
        >
          <option value="">-- Select Subject --</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">
        Add Class
      </button>
    </form>
  );
};

export default AddClassForm;