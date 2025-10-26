import React, { useState, useEffect } from "react";
import { Button } from "../..//components/ui/button";
import { Edit, Trash2, Save, X } from "lucide-react";
import { API_BASE } from "../../lib/api";

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  qualification: string;
  dateOfBirth: string;
  subjectName: string;
  teacherNumber: string;
  joinDate: string;
}

const TeacherRecords: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Teacher>>({});
  const [message, setMessage] = useState("");

  // Fetch all teachers
  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/teachers`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.success) setTeachers(data.teachers);
      else setMessage(`Error: ${data.message}`);
    } catch (error: any) {
      console.error("Error fetching teachers:", error);
      setMessage("Failed to fetch teachers. Please check if you're logged in as admin.");
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

  // Update input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Save edited teacher
  const handleSave = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update teacher");

      setEditingId(null);
      setEditData({});
      setMessage("✅ Teacher updated successfully!");
      fetchTeachers();
    } catch (error: any) {
      console.error("Error saving teacher:", error);
      setMessage(`❌ ${error.message}`);
    }
  };

  // Delete teacher
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;

    try {
      const response = await fetch(`${API_BASE}/api/teachers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete teacher");

      setMessage("✅ Teacher deleted successfully!");
      fetchTeachers();
    } catch (error: any) {
      console.error("Error deleting teacher:", error);
      setMessage(`❌ ${error.message}`);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <div className="p-4 bg-gradient-to-br from-green-50 via-sky-50 to-yellow-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Teacher Records</h1>

      {message && (
        <div
          className={`mb-4 p-3 rounded text-center border ${
            message.startsWith("✅")
              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
              : "bg-red-100 text-red-700 border-red-300"
          }`}
        >
          {message}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-4">
        <table className="min-w-full border border-gray-300 border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border border-gray-300 text-left">ID</th>
              <th className="p-3 border border-gray-300 text-left">Teacher #</th>
              <th className="p-3 border border-gray-300 text-left">First Name</th>
              <th className="p-3 border border-gray-300 text-left">Last Name</th>
              <th className="p-3 border border-gray-300 text-left">Email</th>
              <th className="p-3 border border-gray-300 text-left">Phone</th>
              <th className="p-3 border border-gray-300 text-left">Qualification</th>
              <th className="p-3 border border-gray-300 text-left">Subject</th>
              <th className="p-3 border border-gray-300 text-left">Birth Date</th>
              <th className="p-3 border border-gray-300 text-left">Join Date</th>
              <th className="p-3 border border-gray-300 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="p-4 text-center text-gray-500 border border-gray-300"
                >
                  No teachers found
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  {editingId === teacher.id ? (
                    <>
                      <td className="p-2 border border-gray-300 text-center">{teacher.id}</td>
                      <td className="p-2 border border-gray-300 text-gray-500 text-center">
                        {teacher.teacherNumber}
                      </td>
                      <td className="p-2 border border-gray-300">
                        <input
                          name="firstName"
                          value={editData.firstName ?? ""}
                          onChange={handleChange}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="p-2 border border-gray-300">
                        <input
                          name="lastName"
                          value={editData.lastName ?? ""}
                          onChange={handleChange}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="p-2 border border-gray-300 text-gray-500">{teacher.email}</td>
                      <td className="p-2 border border-gray-300">
                        <input
                          name="phoneNumber"
                          value={editData.phoneNumber ?? ""}
                          onChange={handleChange}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="p-2 border border-gray-300">
                        <input
                          name="qualification"
                          value={editData.qualification ?? ""}
                          onChange={handleChange}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="p-2 border border-gray-300">
                        <select
                          name="subjectName"
                          value={editData.subjectName ?? ""}
                          onChange={handleChange}
                          className="w-full px-2 py-1 border rounded"
                        >
                          <option value="">Select Subject</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Science">Science</option>
                          <option value="English">English</option>
                          <option value="ICT">ICT</option>
                          <option value="History">History</option>
                          <option value="Geography">Geography</option>
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Biology">Biology</option>
                        </select>
                      </td>
                      <td className="p-2 border border-gray-300 text-gray-500">
                        {teacher.dateOfBirth}
                      </td>
                      <td className="p-2 border border-gray-300 text-gray-500">
                        {teacher.joinDate}
                      </td>
                      <td className="p-2 border border-gray-300 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSave(teacher.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEdit}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2 border border-gray-300 text-center">{teacher.id}</td>
                      <td className="p-2 border border-gray-300 text-center font-mono text-sm">
                        {teacher.teacherNumber}
                      </td>
                      <td className="p-2 border border-gray-300">{teacher.firstName}</td>
                      <td className="p-2 border border-gray-300">{teacher.lastName}</td>
                      <td className="p-2 border border-gray-300 text-blue-600">
                        {teacher.email}
                      </td>
                      <td className="p-2 border border-gray-300">{teacher.phoneNumber}</td>
                      <td className="p-2 border border-gray-300">{teacher.qualification}</td>
                      <td className="p-2 border border-gray-300 text-emerald-700 font-medium">
                        {teacher.subjectName}
                      </td>
                      <td className="p-2 border border-gray-300">{teacher.dateOfBirth}</td>
                      <td className="p-2 border border-gray-300">{teacher.joinDate}</td>
                      <td className="p-2 border border-gray-300 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(teacher)}
                          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(teacher.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
