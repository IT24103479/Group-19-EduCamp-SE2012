// src/pages/AdminDashboard.js
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>

      <div className="max-w-2xl mx-auto">
        {/* Manage Class Records Card */}
        <div
          onClick={() => navigate("/class-records")}
          className="cursor-pointer bg-white shadow-lg rounded-lg p-6 hover:bg-gray-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">Class Records</h2>
          <p>View, add, edit, or delete class records. Only accessible by admin.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
