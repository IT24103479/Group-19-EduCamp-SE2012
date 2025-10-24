import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

/**
 * AddClassForm
 * - Sends payload shaped for the current backend (nested teacher object and subjects array of objects)
 * - After successful creation, calls onClassAdded() so parent can refresh (we don't assume returned shape)
 */
const AddClassForm = ({ teachers = [], subjects = [], onClassAdded }) => {
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  // initialize selects when teacher/subject lists arrive
  useEffect(() => {
    if (teachers.length && teacherId === "") setTeacherId(String(teachers[0].id));
    if (subjects.length && subjectId === "") setSubjectId(String(subjects[0].id));
  }, [teachers, subjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a class name");
      return;
    }

    // Build payload matching existing backend createClass which expects ClassEntity with nested teacher and subjects
    const payload: any = {
      name: name.trim(),
      grade: null,
      fee: null,
      timetable: null,
      teacher: teacherId ? { id: Number(teacherId) } : null,
      subjects: subjectId ? [{ id: Number(subjectId) }] : [],
    };

    try {
      const res = await fetch("http://localhost:8081/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create class");
      }

      // Backend may return the saved entity (ClassEntity). We refresh via parent to get DTO fields consistently.
      await res.json().catch(() => null);

      onClassAdded && onClassAdded();
      // reset form
      setName("");
      if (teachers.length) setTeacherId(String(teachers[0].id));
      if (subjects.length) setSubjectId(String(subjects[0].id));
      toast.success("Class created");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add class");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded bg-white">
      <div className="mb-2">
        <label className="block text-sm font-medium">Class name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border px-2 py-1"
          placeholder="Enter class name"
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium">Teacher</label>
        <select
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          className="mt-1 block w-full border px-2 py-1"
        >
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {`${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() || t.email || t.id}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium">Subject</label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="mt-1 block w-full border px-2 py-1"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">
        Add class
      </button>
    </form>
  );
};

AddClassForm.propTypes = {
  teachers: PropTypes.array,
  subjects: PropTypes.array,
  onClassAdded: PropTypes.func,
};

export default AddClassForm;