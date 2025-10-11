// src/pages/AdminDashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Payments Records Card */}
        <div
          className="p-6 bg-sky-500 text-white rounded shadow hover:shadow-lg cursor-pointer text-center"
          onClick={() => alert("Payments Records page (not implemented yet)")}
        >
          <h2 className="text-xl font-semibold">Payments Records</h2>
        </div>

        {/* Teachers Records Card */}
        <div
          className="p-6 bg-green-500 text-white rounded shadow hover:shadow-lg cursor-pointer text-center"
          onClick={() => navigate("/admin-teachers")}
        >
          <h2 className="text-xl font-semibold">Teachers Records</h2>
        </div>

        {/* Students Records Card */}
        <div
          className="p-6 bg-yellow-500 text-white rounded shadow hover:shadow-lg cursor-pointer text-center"
          onClick={() => alert("Students Records page (not implemented yet)")}
        >
          <h2 className="text-xl font-semibold">Students Records</h2>
        </div>

        {/* Class Records Card */}
        <div
          className="p-6 bg-red-500 text-white rounded shadow hover:shadow-lg cursor-pointer text-center"
          onClick={() => alert("Students Records page (not implemented yet)")}
        >
          <h2 className="text-xl font-semibold">Class Records</h2>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;