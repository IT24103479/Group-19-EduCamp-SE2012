import React, { useState, useEffect } from "react";

interface Subject {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  name?: string;
  subject?: Subject | null;
  email?: string;
  phone?: string;
  qualification?: string;
  b_day?: string;
  j_date?: string;
}

const TeacherRecords: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Teacher>>({});

  // Get headers
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

  // Fetch all teachers
  const fetchTeachers = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/teachers", { headers });
      const data = await response.json();
      console.log("Fetched teachers:", data);

      let teacherList: any[] = [];

      if (Array.isArray(data)) {
        teacherList = data;
      } else if (data.success && Array.isArray(data.teachers)) {
        teacherList = data.teachers;
      } else {
        console.warn("Unexpected teacher data format:", data);
        teacherList = [];
      }

      const formatted = teacherList.map((t: any) => ({
        id: t.id ?? 0,
        firstName: t.firstName ?? "",
        lastName: t.lastName ?? "",
        name: `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim(),
        subject: t.subjectName ? { id: 0, name: t.subjectName } : null,
        email: t.email ?? "",
        phone: t.phoneNumber ?? "",
        qualification: t.qualification ?? "",
        b_day: t.dateOfBirth ?? "",
        j_date: t.joinDate ?? "",
      }));

      setTeachers(formatted);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setTeachers([]);
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "subject") {
      setEditData({ ...editData, subject: { id: 0, name: value } });
    } else {
      setEditData({ ...editData, [name]: value });
    }
  };

  // Save edited teacher to backend
  const handleSave = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8081/api/teachers/${id}`, {
        method: "PUT",
        headers,
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
    try {
      const res = await fetch(`http://localhost:8081/api/teachers/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchTeachers();
    } catch (err) {
      console.error("Error deleting teacher:", err);
      alert("Failed to delete teacher.");
    }
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
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-500">
                  No teachers found.
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
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
                          value={editData.subject?.name || ""}
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
                      <td className="p-2 border">
                        {teacher.name || `${teacher.firstName} ${teacher.lastName}`}
                      </td>
                      <td className="p-2 border">{teacher.subject?.name ?? "—"}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherRecords;
