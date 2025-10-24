import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

interface ClassForm {
  name: string;
  teacherId: number;
  fee: number;
  timetable: string;
}

const AddClassForm: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState<ClassForm>({
    name: "",
    teacherId: 0,
    fee: 0,
    timetable: "",
  });

    function getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  function getSessionHeader(): Record<string, string> {
    const sessionId = localStorage.getItem("sessionId");
    return sessionId ? { "X-Session-Id": sessionId } : {};
  }

  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...getSessionHeader(),
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

const fetchTeachers = async () => {
  try {
    const res = await fetch("http://localhost:8081/api/teachers", { headers });
    const data = await res.json();
    let teacherList: any[] = [];
    if (Array.isArray(data)) teacherList = data;
    else if (data.success && Array.isArray(data.teachers)) teacherList = data.teachers;
    else teacherList = [];

    setTeachers(
      teacherList.map((t: any) => ({
        id: t.id ?? 0,
        firstName: t.firstName ?? "",
        lastName: t.lastName ?? "",
      }))
    );
  } catch (err) {
    console.error(err);
    setTeachers([]);
    toast.error("Failed to fetch teachers");
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8081/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add class");
      toast.success("Class added successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add class");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Class Name"
        value={form.name}
        onChange={handleChange}
      />
      <select name="teacherId" value={form.teacherId} onChange={handleChange}>
        <option value={0}>Select Teacher</option>
        {teachers?.map((t) => (
          <option key={t.id} value={t.id}>
            {t.firstName} {t.lastName}
          </option>
        ))}
      </select>
      <input
        type="number"
        name="fee"
        placeholder="Fee"
        value={form.fee}
        onChange={handleChange}
      />
      <input
        type="text"
        name="timetable"
        placeholder="Timetable"
        value={form.timetable}
        onChange={handleChange}
      />
      <button type="submit">Add Class</button>
    </form>
  );
};

export default AddClassForm;
