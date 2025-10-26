import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE } from "../../lib/api";

interface Teacher {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

interface ClassData {
  class_id: number;
  grade: string;
  fee: number;
  timetable: string;
  teacher: Teacher;
  subjects: Subject[];
}

const EditClass: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [grade, setGrade] = useState("");
  const [fee, setFee] = useState("");
  const [timetable, setTimetable] = useState("");
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const classRes = await fetch(`${API_BASE}/classes/${id}`);
        if (!classRes.ok) throw new Error("Failed to fetch class");
        const classJson: ClassData = await classRes.json();
        setClassData(classJson);

        setGrade(classJson.grade);
        setFee(classJson.fee.toString());
        setTimetable(classJson.timetable);
        setTeacherId(classJson.teacher?.id ?? null);
        setSubjectId(classJson.subjects?.[0]?.id ?? null);

        const teacherRes = await fetch(`${API_BASE}/api/teachers`);
        const teacherJson = await teacherRes.json();
        setTeachers(teacherJson);

        const subjectRes = await fetch(`${API_BASE}/api/subjects`);
        const subjectJson = await subjectRes.json();
        setSubjects(subjectJson);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, [id]);

  // Save updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!classData || !teacherId || !subjectId) {
      toast.error("Please fill all required fields");
      return;
    }

    const updatedClass = {
      class_id: classData.class_id,
      grade,
      fee: parseFloat(fee),
      timetable,
      teacher: {
        id: teacherId,
        name: teachers.find(t => t.id === teacherId)?.name || "",
      },
      subjects: [
        {
          id: subjectId,
          name: subjects.find(s => s.id === subjectId)?.name || "",
        },
      ],
    };

    try {
      const res = await fetch(`${API_BASE}/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedClass),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      toast.success("Class updated successfully!");
      // Stay on same page — don't navigate away.
      // The user can manually click browser Back button if desired.
    } catch (error) {
      console.error(error);
      toast.error("Failed to update class");
    }
  };

  const handleCancel = () => {
    // Go back to previous page (like ClassRecords)
    navigate(-1);
  };

  if (!classData) return <p>Loading class details...</p>;

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-4">Edit Class</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Grade</label>
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full border rounded p-2 bg-white"
          />
        </div>

        <div>
          <label className="block font-medium">Fee</label>
          <input
            type="number"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="w-full border rounded p-2 bg-white"
          />
        </div>

        <div>
          <label className="block font-medium">Timetable</label>
          <input
            value={timetable}
            onChange={(e) => setTimetable(e.target.value)}
            className="w-full border rounded p-2 bg-white"
          />
        </div>

        <div>
          <label className="block font-medium">Teacher</label>
          <select
            value={teacherId ?? ""}
            onChange={(e) => setTeacherId(Number(e.target.value))}
            className="w-full border rounded p-2 bg-white"
          >
            <option value="">Select teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Subject</label>
          <select
            value={subjectId ?? ""}
            onChange={(e) => setSubjectId(Number(e.target.value))}
            className="w-full border rounded p-2 bg-white"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Save
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditClass;