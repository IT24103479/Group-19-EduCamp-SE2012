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

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/teachers");
      const data = await res.json();
      setTeachers(Array.isArray(data) ? data : []);
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
