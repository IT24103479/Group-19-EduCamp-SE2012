import React, { useState, useEffect } from "react";
import type { ClassItem, Teacher, Subject } from "../../types";
import AddClassForm from "../../components/AddClassForm";
import { toast } from "react-toastify";
import { Trash, Edit } from "lucide-react";
import { Button } from "../..//components/ui/button";

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

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getSessionHeader = () => {
    const sessionId = localStorage.getItem("sessionId");
    return sessionId ? { "X-Session-Id": sessionId } : {};
  };

  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...getSessionHeader(),
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch("http://localhost:8081/classes", { headers });
      const data = await res.json();
      const formatted = data.map((cls: any) => ({
        ...cls,
        id: cls.id ?? cls.class_id ?? 0,
        teacher: cls.teacher ?? null,
        subjects: cls.subjects ?? [],
      }));
      setClasses(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch classes");
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/teachers", { headers });
      const data = await res.json();
      let teacherList: any[] = [];
      if (Array.isArray(data)) teacherList = data;
      else if (data.success && Array.isArray(data.teachers)) teacherList = data.teachers;

      const formatted: Teacher[] = teacherList.map((t: any) => ({
        id: t.id ?? 0,
        firstName: t.firstName ?? "",
        lastName: t.lastName ?? "",
        email: t.email ?? "",
        phone: t.phoneNumber ?? "",
        qualification: t.qualification ?? "",
        b_day: t.dateOfBirth ?? "",
        j_date: t.joinDate ?? "",
        subject: t.subjectName ? { id: 0, name: t.subjectName } : null,
      }));

      setTeachers(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch("http://localhost:8081/subjects", { headers });
      const data = await res.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const getTeacherFullName = (teacher: Teacher | undefined) =>
    teacher ? `${teacher.firstName} ${teacher.lastName}` : "No teacher";

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
      const teacher = teachers.find(t => t.id === Number(value)) ?? null;
      setEditData(prev => ({ ...prev, teacher }));
    } else if (name === "subject") {
      const subject = subjects.find(s => s.id === Number(value)) ?? null;
      setEditData(prev => ({ ...prev, subjects: subject ? [subject] : [] }));
    } else {
      setEditData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Updated PUT request to match backend
  const handleSave = async (cls: ClassItem) => {
    const updatedClass = {
      grade: editData.grade ?? "",
      fee: editData.fee ?? 0,
      timetable: editData.timetable ?? "",
      teacher: editData.teacher ? { id: editData.teacher.id } : null,
      subjects: (editData.subjects ?? []).map((s) => ({ id: s.id })),
    };

    try {
      const res = await fetch(`http://localhost:8081/classes/${cls.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updatedClass),
      
      });
      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error("Failed to update class");
      
      const normalized = {
  ...data,
  id: data.id ?? data.class_id, // ensure consistent id key
};
      setClasses(prev => prev.map(c => (c.id === cls.id ? normalized : c)));
      setEditingId(null);
      setEditData({});
      toast.success("Class updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update class");
    }
  };

  const handleDelete = async (id: number) => {
    if (!id || id === 0) return toast.error("Invalid class ID");
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      const res = await fetch(`http://localhost:8081/classes/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Failed to delete class");
      setClasses(prev => prev.filter(c => c.id !== id));
      toast.success("Class deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete class");
    }
  };
  return (
    <div className="p-4 bg-gradient-to-br from-green-50 via-sky-50 to-yellow-50 min-h-screen space-y-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Class Records</h1>

      <AddClassForm
        teachers={teachers}
        subjects={subjects}
        classes={classes}
        onClassAdded={newClass =>
          setClasses(prev => [...prev, { ...newClass, id: newClass.id ?? 0 }])
        }
      />

      <div className="overflow-x-auto bg-white rounded-lg shadow-card mt-4">
        <table className="min-w-full border border-slate-200 border-collapse">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 border border-slate-200 text-left text-slate-700">Grade</th>
              <th className="p-3 border border-slate-200 text-left text-slate-700">Fee</th>
              <th className="p-3 border border-slate-200 text-left text-slate-700">Teacher</th>
              <th className="p-3 border border-slate-200 text-left text-slate-700">Subjects</th>
              <th className="p-3 border border-slate-200 text-left text-slate-700">Timetable</th>
              <th className="p-3 border border-slate-200 text-left text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(cls => (
              <tr key={cls.id} className="hover:bg-slate-50">
                {editingId === cls.id ? (
                  <>
                    <td className="p-2 border border-slate-200">
                      <input
                        name="grade"
                        value={editData.grade ?? ""}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border rounded bg-white"
                      />
                    </td>
                    <td className="p-2 border border-slate-200">
                      <input
                        type="number"
                        name="fee"
                        value={editData.fee ?? ""}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border rounded bg-white"
                      />
                    </td>
                    <td className="p-2 border border-slate-200">
                      <select
                        name="teacher"
                        value={editData.teacher?.id ?? ""}
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
                    <td className="p-2 border border-slate-200">
                      <select
                        name="subject"
                        value={editData.subjects?.[0]?.id ?? ""}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border rounded bg-white"
                      >
                        <option value="">-- Select Subject --</option>
                        {subjects.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border border-slate-200">
                      <input
                        name="timetable"
                        value={editData.timetable ?? ""}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border rounded bg-white"
                      />
                    </td>
                    <td className="p-2 border border-slate-200 flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleSave(cls)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2 border border-slate-200">{cls.grade}</td>
                    <td className="p-2 border border-slate-200">{cls.fee}</td>
                    <td className="p-2 border border-slate-200">{getTeacherFullName(cls.teacher)}</td>
                    <td className="p-2 border border-slate-200">
                      {cls.subjects.map(s => s.name).join(", ") || "No subjects"}
                    </td>
                    <td className="p-2 border border-slate-200">{cls.timetable}</td>
                    <td className="p-2 border border-slate-200 flex gap-2">
                      <Button
                      
                        variant="ghost"
                        size="sm"
                        className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        onClick={() => handleEditClick(cls)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDelete(cls.id ?? 0)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
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