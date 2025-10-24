import React, { useState, useEffect } from "react";

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
      const response = await fetch("http://localhost:8081/api/teachers", {
        method: "GET",
        credentials: "include" // Important for session cookies
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTeachers(data.teachers);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
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

  // Update input fields while editing
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Save edited teacher to backend
  const handleSave = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8081/api/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update teacher");
      }

      setEditingId(null);
      setEditData({});
      setMessage("✅ Teacher updated successfully!");
      fetchTeachers(); // refresh table
    } catch (error) {
      console.error("Error saving teacher:", error);
      setMessage(`❌ ${error.message}`);
    }
  };

  // Delete teacher
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this teacher? This action cannot be undone.")) return;
    
    try {
      const response = await fetch(`http://localhost:8081/api/teachers/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete teacher");
      }

      setMessage("✅ Teacher deleted successfully!");
      fetchTeachers();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      setMessage(`❌ ${error.message}`);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <div className="p-8 bg-gradient-to-br from-green-50 via-sky-50 to-yellow-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Teacher Records</h1>

      {message && (
        <div className={`mb-4 p-3 rounded text-center ${
          message.startsWith("✅") 
            ? "bg-emerald-100 text-emerald-700 border border-emerald-300" 
            : "bg-red-100 text-red-700 border border-red-300"
        }`}>
          {message}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-emerald-600 text-white">
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Teacher Number</th>
              <th className="p-3 border">First Name</th>
              <th className="p-3 border">Last Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">Qualification</th>
              <th className="p-3 border">Subject</th>
              <th className="p-3 border">Birth Date</th>
              <th className="p-3 border">Join Date</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-4 text-center text-gray-500">
                  No teachers found
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  {editingId === teacher.id ? (
                    // Edit Mode
                    <>
                      <td className="p-2 border text-center">{teacher.id}</td>
                      <td className="p-2 border text-center text-gray-500">
                        {teacher.teacherNumber}
                      </td>
                      <td className="p-2 border">
                        <input
                          type="text"
                          name="firstName"
                          value={editData.firstName || ""}
                          onChange={handleChange}
                          className="border p-1 rounded w-full"
                          placeholder="First Name"
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="text"
                          name="lastName"
                          value={editData.lastName || ""}
                          onChange={handleChange}
                          className="border p-1 rounded w-full"
                          placeholder="Last Name"
                        />
                      </td>
                      <td className="p-2 border text-gray-500">
                        {teacher.email}
                      </td>
                      <td className="p-2 border">
                        <input
                          type="text"
                          name="phoneNumber"
                          value={editData.phoneNumber || ""}
                          onChange={handleChange}
                          className="border p-1 rounded w-full"
                          placeholder="Phone Number"
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="text"
                          name="qualification"
                          value={editData.qualification || ""}
                          onChange={handleChange}
                          className="border p-1 rounded w-full"
                          placeholder="Qualification"
                        />
                      </td>
                      <td className="p-2 border">
                        <select
                          name="subjectName"
                          value={editData.subjectName || ""}
                          onChange={handleChange}
                          className="border p-1 rounded w-full"
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
                      <td className="p-2 border text-gray-500">
                        {teacher.dateOfBirth}
                      </td>
                      <td className="p-2 border text-gray-500">
                        {teacher.joinDate}
                      </td>
                      <td className="p-2 border flex gap-2 justify-center">
                        <button
                          onClick={() => handleSave(teacher.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 text-sm"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    // View Mode
                    <>
                      <td className="p-2 border text-center">{teacher.id}</td>
                      <td className="p-2 border text-center font-mono text-sm">
                        {teacher.teacherNumber}
                      </td>
                      <td className="p-2 border font-medium">{teacher.firstName}</td>
                      <td className="p-2 border font-medium">{teacher.lastName}</td>
                      <td className="p-2 border text-blue-600">{teacher.email}</td>
                      <td className="p-2 border">{teacher.phoneNumber}</td>
                      <td className="p-2 border">{teacher.qualification}</td>
                      <td className="p-2 border font-medium text-emerald-700">
                        {teacher.subjectName}
                      </td>
                      <td className="p-2 border">{teacher.dateOfBirth}</td>
                      <td className="p-2 border">{teacher.joinDate}</td>
                      <td className="p-2 border flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditClick(teacher)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
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