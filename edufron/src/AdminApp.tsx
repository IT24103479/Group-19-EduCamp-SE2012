// AdminApp.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClassRecords from "./pages/admin/ClassRecords";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminProfile from "./pages/admin/AdminProfile";
import NotFound from "./pages/NotFound";

const AdminApp: React.FC = () => {
  return (
    <BrowserRouter basename="/admin"> {/* BASE PATH /admin */}
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="classes" element={<ClassRecords />} />
          <Route path="teachers" element={<AdminTeachers />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="enrollments" element={<AdminEnrollments />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AdminApp;
