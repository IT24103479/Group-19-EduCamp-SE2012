import React, { useState } from "react";
import type { ClassItem, Teacher, Subject } from "../types";
import { toast } from "react-toastify";
import { API_BASE } from "../lib/api";

interface AddClassFormProps {
  teachers: Teacher[];
  subjects: Subject[];
  onClassAdded: (cls: ClassItem) => void;
}

const AddClassForm: React.FC<AddClassFormProps> = ({
  teachers,
  subjects,
  onClassAdded,
}) => {
  const [grade, setGrade] = useState("");
  const [fee, setFee] = useState<number | "">("");
  const [timetable, setTimetable] = useState("");
  const [teacherId, setTeacherId] = useState<number | "">("");
  const [subjectId, setSubjectId] = useState<number | "">("");
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("token")
      ? `Bearer ${localStorage.getItem("token")}`
      : "",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!grade || !fee || !timetable || !teacherId || !subjectId) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Build the payload matching backend ClassEntity structure
    const teacher = teachers.find((t) => t.id === Number(teacherId));
    const subject = subjects.find((s) => s.id === Number(subjectId));

    if (!teacher || !subject) {
      toast.error("Invalid teacher or subject selection");
      return;
    }

    const newClass = {
      grade,
      fee: Number(fee),
      timetable,
      teacher,             // nested teacher object
      subjects: [subject], // array of subject objects
    };

    try {
      const res = await fetch(`${API_BASE}/classes`, {
        method: "POST",
        headers,
        body: JSON.stringify(newClass),
      });
        console.log("Add class response status:", res);
      if (!res.ok) throw new Error("Failed to add class");

      const data = await res.json();
      console.log("Added class:", data);
      onClassAdded({
        ...data,
        id: data.class_id, // normalize id for frontend
      });
      toast.success("Class added!");

      setGrade("");
      setFee("");
      setTimetable("");
      setTeacherId("");
      setSubjectId("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add class");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow-md flex flex-col gap-3"
    >
      <h2 className="text-xl font-bold mb-2">Add New Class</h2>

      <input
        type="text"
        placeholder="Grade"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        className="border px-2 py-1 rounded w-full"
      />

      <input
        type="number"
        placeholder="Fee"
        value={fee}
        onChange={(e) =>
          setFee(e.target.value === "" ? "" : Number(e.target.value))
        }
        className="border px-2 py-1 rounded w-full"
      />

      <input
        type="text"
        placeholder="Timetable"
        value={timetable}
        onChange={(e) => setTimetable(e.target.value)}
        className="border px-2 py-1 rounded w-full"
      />

      <select
        value={teacherId}
        onChange={(e) => setTeacherId(Number(e.target.value))}
        className="border px-2 py-1 rounded w-full"
      >
        <option value="">-- Select Teacher --</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>
            {t.firstName} {t.lastName}
          </option>
        ))}
      </select>

      <select
        value={subjectId}
        onChange={(e) => setSubjectId(Number(e.target.value))}
        className="border px-2 py-1 rounded w-full"
      >
        <option value="">-- Select Subject --</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
      >
        Add Class
      </button>
    </form>
  );
};

export default AddClassForm;
