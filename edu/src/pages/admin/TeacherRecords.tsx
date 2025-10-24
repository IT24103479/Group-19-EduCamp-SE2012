import React, { useState, useEffect } from "react";

interface Teacher {
  id: number;
  name: string;
  subject: { id: number; name: string };
  email: string;
  phone: string;
  qualification: string;
  b_day: string;
  j_date: string;
}

const TeacherRecords: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Teacher>>({});

  // Fetch all teachers
  const fetchTeachers = async () => {
    try {
      const response = await fetch("http://localhost:8080/teachers");
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Start editing a row
  const handleEditClick = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setEditData({ ...teacher });
  };

  // Update input fields while editing
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Save edited teacher to backend
  const handleSave = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/teachers/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error("Failed to update teacher");

      setEditingId(null);
      setEditData({});
      fetchTeachers(); // refresh table
    } catch (error) {
      console.error("Error saving teacher:", error);
      alert("Failed to update teacher.");
    }
  };

  // Delete teacher
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    await fetch(`http://localhost:8080/teachers/${id}`, { method: "DELETE" });
    fetchTeachers();
  };

  return (
    <div className="p-8 bg-gradient-to-br from-green-50 via-sky-50 to-yellow-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Teacher Records</h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-emerald-600 text-white">
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Subject</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">Qualification</th>
              <th className="p-3 border">Birth Day</th>
              <th className="p-3 border">Join Date</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50">
                {editingId === teacher.id ? (
                  <>
                    <td className="p-2 border text-center">{teacher.id}</td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        name="name"
                        value={editData.name || ""}
                        onChange={handleChange}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        name="subject"
                        value={editData.subject?.name|| ""}
                        onChange={handleChange}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="email"
                        name="email"
                        value={editData.email || ""}
                        onChange={handleChange}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        name="phone"
                        value={editData.phone || ""}
                        onChange={handleChange}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        name="qualification"
                        value={editData.qualification || ""}
                        onChange={handleChange}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="date"
                        name="b_day"
                        value={editData.b_day || ""}
                        onChange={handleChange}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="date"
                        name="j_date"
                        value={editData.j_date || ""}
                        onChange={handleChange}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 border flex gap-2 justify-center">
                      <button
                        onClick={() => handleSave(teacher.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2 border text-center">{teacher.id}</td>
                    <td className="p-2 border">{teacher.name}</td>
                    <td className="p-2 border">{teacher.subject?.name}</td>
                    <td className="p-2 border">{teacher.email}</td>
                    <td className="p-2 border">{teacher.phone}</td>
                    <td className="p-2 border">{teacher.qualification}</td>
                    <td className="p-2 border">{teacher.b_day}</td>
                    <td className="p-2 border">{teacher.j_date}</td>
                    <td className="p-2 border flex gap-2 justify-center">
                      <button
                        onClick={() => handleEditClick(teacher)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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

export default TeacherRecords;
