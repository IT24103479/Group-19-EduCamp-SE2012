import React, { useState, useEffect } from "react";
import type { ClassItem, Teacher, Subject } from "../../types";
import AddClassForm from "../../components/AddClassForm";
import { toast } from "react-toastify";

const ClassRecords: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<ClassItem>>({});

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchSubjects();
  }, []);

  const sessionId = localStorage.getItem("sessionId");

  const fetchClasses = async () => {
    try {
      const res = await fetch("http://localhost:8081/classes");
      const data = await res.json();
      const formatted = data.map((cls: any) => ({ ...cls, id: cls.id ?? cls.class_id }));
      setClasses(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch classes");
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/teachers");
      setTeachers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch("http://localhost:8081/subjects");
      setSubjects(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const getTeacherFullName = (teacher: Teacher | undefined) => {
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : "No teacher";
  };

  const handleEditClick = (cls: ClassItem) => {
    setEditingId(cls.id);
    setEditData({
      grade: cls.grade,
      fee: cls.fee,
      timetable: cls.timetable,
      teacher: cls.teacher,
      subjects: cls.subjects,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "fee") {
      setEditData(prev => ({ ...prev, [name]: value === "" ? undefined : Number(value) }));
    } else if (name === "teacher") {
      const teacher = teachers.find(t => t.id === Number(value));
      setEditData(prev => ({ ...prev, teacher }));
    } else if (name === "subject") {
      const subject = subjects.find(s => s.id === Number(value));
      setEditData(prev => ({ ...prev, subjects: subject ? [subject] : [] }));
    } else {
      setEditData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (cls: ClassItem) => {
    const updatedClass: ClassItem = {
      ...cls,
      grade: editData.grade || "",
      fee: editData.fee || 0,
      timetable: editData.timetable || "",
      teacher: editData.teacher,
      subjects: editData.subjects || [],
    };

    try {
      const res = await fetch(`http://localhost:8081/classes/${cls.id}`, {
        method: "PUT",
         credentials: "include",
        headers: { "Content-Type": "application/json",
           "Cookie": `JSESSIONID=${sessionId}`,
         },
        body: JSON.stringify(updatedClass),
      });
      if (!res.ok) throw new Error("Failed to update class");
      const data = await res.json();
      console.log("Updated class response:", data);
      setClasses(prev => prev.map(c => (c.id === cls.id ? data : c)));
      setEditingId(null);
      setEditData({});
      toast.success("Class updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update class");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      const res = await fetch(`http://localhost:8081/classes/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete class");
      setClasses(prev => prev.filter(c => c.id !== id));
      toast.success("Class deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete class");
    }
  };

  return (
    <div className="p-4 bg-gradient-to-br from-green-50 via-sky-50 to-yellow-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Class Records</h1>

      <AddClassForm
        teachers={teachers}
        subjects={subjects}
        classes={classes}
        onClassAdded={(newClass: ClassItem) => setClasses(prev => [...prev, newClass])}
      />

      <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-4">
        <table className="min-w-full border border-gray-300 border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border border-gray-300 text-left">Grade</th>
              <th className="p-3 border border-gray-300 text-left">Fee</th>
              <th className="p-3 border border-gray-300 text-left">Teacher</th>
              <th className="p-3 border border-gray-300 text-left">Subjects</th>
              <th className="p-3 border border-gray-300 text-left">Timetable</th>
              <th className="p-3 border border-gray-300 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(cls => (
              <tr key={cls.id} className="hover:bg-gray-50">
                {editingId === cls.id ? (
                  <>
                    <td className="p-2 border border-gray-300">
                      <input
                        name="grade"
                        value={editData.grade || ""}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border rounded bg-white"
                      />
                    </td>
                    <td className="p-2 border border-gray-300">
                      <input
                        type="number"
                        name="fee"
                        value={editData.fee ?? ""}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border rounded bg-white"
                      />
                    </td>
                    <td className="p-2 border border-gray-300">
                      <select
                        name="teacher"
                        value={editData.teacher?.id || ""}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border rounded bg-white"
                      >
                        <option value="">-- Select Teacher --</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>
                            {getTeacherFullName(t)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border border-gray-300">
                      <select
                        name="subject"
                        value={editData.subjects?.[0]?.id || ""}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border rounded bg-white"
                      >
                        <option value="">-- Select Subject --</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </td>
                    <td className="p-2 border border-gray-300">
                      <input
                        name="timetable"
                        value={editData.timetable || ""}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border rounded bg-white"
                      />
                    </td>
                    <td className="p-2 border border-gray-300 flex gap-2">
                      <button
                        onClick={() => handleSave(cls)}
                        className="bg-green-600 text-white px-2 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-400 text-white px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2 border border-gray-300">{cls.grade}</td>
                    <td className="p-2 border border-gray-300">{cls.fee}</td>
                    <td className="p-2 border border-gray-300">{getTeacherFullName(cls.teacher)}</td>
                    <td className="p-2 border border-gray-300">{cls.subjects.map(s => s.name).join(", ") || "No subjects"}</td>
                    <td className="p-2 border border-gray-300">{cls.timetable}</td>
                    <td className="p-2 border border-gray-300 flex gap-2">
                      <button
                        onClick={() => handleEditClick(cls)}
                        className="bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cls.id!)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassRecords;
