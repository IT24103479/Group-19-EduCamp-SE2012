import React, { useState, useEffect } from "react";

function AddClassForm({ onClassAdded }) {
  const [grade, setGrade] = useState("");
  const [fee, setFee] = useState("");
  const [timetable, setTimetable] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Fetch teachers and subjects from backend
  useEffect(() => {
    fetch("http://localhost:8080/teachers")
      .then(res => res.json())
      .then(data => setTeachers(data))
      .catch(err => console.error(err));

    fetch("http://localhost:8080/subjects")
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newClass = {
      grade,
      fee: parseFloat(fee),
      timetable,
      teacher: { id: parseInt(teacherId) },
      subjects: subjectId ? [{ id: parseInt(subjectId) }] : []
    };

    fetch("http://localhost:8080/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClass)
    })
      .then(res => res.json())
      .then(data => {
        onClassAdded(data);
        setGrade("");
        setFee("");
        setTimetable("");
        setTeacherId("");
        setSubjectId("");
      })
      .catch(err => console.error(err));
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded bg-gray-100 mb-4">
      <h2 className="text-lg font-bold mb-2">Add New Class</h2>

      {/* Grade */}
      <div className="mb-2">
        <label>Grade:</label>
        <input type="text" value={grade} onChange={e => setGrade(e.target.value)} className="border px-2 py-1 w-full" required />
      </div>

      {/* Fee */}
      <div className="mb-2">
        <label>Fee:</label>
        <input type="number" value={fee} onChange={e => setFee(e.target.value)} className="border px-2 py-1 w-full" required />
      </div>

      {/* Timetable */}
      <div className="mb-2">
        <label>Timetable:</label>
        <input type="text" value={timetable} onChange={e => setTimetable(e.target.value)} className="border px-2 py-1 w-full" required />
      </div>

      {/* Teacher Dropdown */}
      <div className="mb-2">
        <label>Teacher:</label>
        <select value={teacherId} onChange={e => setTeacherId(e.target.value)} className="border px-2 py-1 w-full" required>
          <option value="">-- Select Teacher --</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Subject Dropdown */}
      <div className="mb-2">
        <label>Subject:</label>
        <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="border px-2 py-1 w-full" required>
          <option value="">-- Select Subject --</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Add Class
      </button>
    </form>
  );
}

export default AddClassForm;
