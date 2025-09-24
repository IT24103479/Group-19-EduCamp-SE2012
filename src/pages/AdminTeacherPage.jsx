import React, { useState, useEffect } from "react";
import axios from "axios";

function AdminTeacherPage() {
  const [teacher, setTeacher] = useState({ name: "", subject: "", email: "" });
  const [teachers, setTeachers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/teachers");
      setTeachers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/teachers/${editingId}`, teacher);
      } else {
        await axios.post("http://localhost:5000/teachers", teacher);
      }
      setTeacher({ name: "", subject: "", email: "" });
      setEditingId(null);
      fetchTeachers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (t) => {
    setTeacher({ name: t.name, subject: t.subject, email: t.email });
    setEditingId(t._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/teachers/${id}`);
      fetchTeachers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Teachers</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={teacher.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          type="text"
          name="subject"
          value={teacher.subject}
          onChange={handleChange}
          placeholder="Subject"
          required
        />
        <input
          type="email"
          name="email"
          value={teacher.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <button type="submit">{editingId ? "Update" : "Add"} Teacher</button>
      </form>

      <div style={{ marginTop: "20px" }}>
        {teachers.map((t) => (
          <div key={t._id} style={{ marginBottom: "10px" }}>
            <strong>{t.name}</strong> - {t.subject} - {t.email}
            <button onClick={() => handleEdit(t)} style={{ marginLeft: "10px" }}>
              Edit
            </button>
            <button onClick={() => handleDelete(t._id)} style={{ marginLeft: "5px" }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminTeacherPage;
