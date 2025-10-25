import React, { useState, useEffect } from "react";
import type { ClassItem, Teacher, Subject } from "../../types";
import { toast } from "react-toastify";

interface EditClassFormProps {
  classData: ClassItem;
  classes: ClassItem[];
  onClassUpdated: (updated: ClassItem) => void;
  onCancel: () => void;
}

const EditClassForm: React.FC<EditClassFormProps> = ({ classData, classes, onClassUpdated, onCancel }) => {
  const [grade, setGrade] = useState(classData.grade);
  const [fee, setFee] = useState(classData.fee.toString());
  const [timetable, setTimetable] = useState(classData.timetable);
  const [teacherId, setTeacherId] = useState<number | "">(classData.teacher?.id || "");
  const [subjectId, setSubjectId] = useState<number | "">(classData.subjects?.[0]?.id || "");

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetch("http://localhost:8081/teachers").then(r => r.json()).then(setTeachers).catch(console.error);
    fetch("http://localhost:8081/subjects").then(r => r.json()).then(setSubjects).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || !subjectId) { toast.error("Select teacher & subject"); return; }

    const updatedClass: ClassItem = {
      id: classData.id,
      grade,
      fee: parseFloat(fee),
      timetable,
      teacher: teachers.find(t => t.id === teacherId),
      subjects: [{ id: subjectId, name: subjects.find(s => s.id === subjectId)?.name || "" }],
    };

    try {
      const res = await fetch(`http://localhost:8081/classes/${classData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedClass),
      });
      if (!res.ok) throw new Error("Failed to update class");
      const data = await res.json();
      onClassUpdated(data);
      toast.success("Class updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update class");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded bg-gray-50 mb-4">
      <h2 className="text-lg font-bold mb-4">Edit Class</h2>
      <input value={grade} onChange={e => setGrade(e.target.value)} className="w-full mb-2 px-2 py-1 border rounded bg-white" placeholder="Grade"/>
      <input type="number" value={fee} onChange={e => setFee(e.target.value)} className="w-full mb-2 px-2 py-1 border rounded bg-white" placeholder="Fee"/>
      <input value={timetable} onChange={e => setTimetable(e.target.value)} className="w-full mb-2 px-2 py-1 border rounded bg-white" placeholder="Timetable"/>
      <select value={teacherId} onChange={e => setTeacherId(Number(e.target.value))} className="w-full mb-2 px-2 py-1 border rounded bg-white">
        <option value="">-- Select Teacher --</option>
        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <select value={subjectId} onChange={e => setSubjectId(Number(e.target.value))} className="w-full mb-4 px-2 py-1 border rounded bg-white">
        <option value="">-- Select Subject --</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <div className="flex gap-2">
        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded">Save Changes</button>
        <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
      </div>
    </form>
  );
};

export default EditClassForm;