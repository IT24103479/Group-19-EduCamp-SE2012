import React, { useState } from "react";
import type { Teacher, Subject, ClassItem } from "../types";
import { toast } from "react-toastify";

interface AddClassFormProps {
  teachers: Teacher[];
  subjects: Subject[];
  classes: ClassItem[];
  onClassAdded: (newClass: ClassItem) => void;
}

const AddClassForm: React.FC<AddClassFormProps> = ({ teachers, subjects, classes, onClassAdded }) => {
  const [grade, setGrade] = useState("");
  const [fee, setFee] = useState<string>(""); // keep as string for controlled input
  const [timetable, setTimetable] = useState("");
  const [teacherId, setTeacherId] = useState<number | "">("");
  const [subjectId, setSubjectId] = useState<number | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!grade || !fee || !teacherId || !subjectId) {
      toast.error("Please fill all fields");
      return;
    }

    const newClass: ClassItem = {
      id: Math.random(), // temporary ID, server will assign real one
      grade,
      fee: parseFloat(fee), // convert to number only when submitting
      timetable,
      teacher: teachers.find(t => t.id === teacherId)!,
      subjects: [{
        id: subjectId,
        name: subjects.find(s => s.id === subjectId)?.name || "",
      }],
    };

    try {
      const res = await fetch("http://localhost:8080/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClass),
      });
      if (!res.ok) throw new Error("Failed to add class");

      const data = await res.json();
      onClassAdded(data);

      // Reset form
      setGrade("");
      setFee(""); // empty again
      setTimetable("");
      setTeacherId("");
      setSubjectId("");

      toast.success("Class added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add class");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded bg-gray-50 mb-4">
      <h2 className="text-lg font-bold mb-4">Add Class</h2>

      <input
        value={grade}
        onChange={e => setGrade(e.target.value)}
        placeholder="Grade"
        className="w-full mb-2 px-2 py-1 border rounded bg-white"
      />

      <input
        type="number"
        value={fee}
        onChange={e => setFee(e.target.value)}
        placeholder="Fee"
        className="w-full mb-2 px-2 py-1 border rounded bg-white"
      />

      <input
        value={timetable}
        onChange={e => setTimetable(e.target.value)}
        placeholder="Timetable"
        className="w-full mb-2 px-2 py-1 border rounded bg-white"
      />

      <select
        value={teacherId}
        onChange={e => setTeacherId(Number(e.target.value))}
        className="w-full mb-2 px-2 py-1 border rounded bg-white"
      >
        <option value="">-- Select Teacher --</option>
        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <select
        value={subjectId}
        onChange={e => setSubjectId(Number(e.target.value))}
        className="w-full mb-4 px-2 py-1 border rounded bg-white"
      >
        <option value="">-- Select Subject --</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      <button
        type="submit"
        className="bg-emerald-600 text-white w-full py-2 rounded hover:bg-emerald-700"
      >
        Add Class
      </button>
    </form>
  );
};

export default AddClassForm;
