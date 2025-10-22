import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClassRecords from "./pages/admin/ClassRecords";
import TeacherRecords from "./pages/admin/TeacherRecords"; // updated import
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProfile from "./pages/admin/AdminProfile";
import NotFound from "./pages/NotFound";

const AdminApp: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Parent layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="classes" element={<ClassRecords />} />
          <Route path="teachers" element={<TeacherRecords />} /> {/* fixed route */}
          <Route path="users" element={<AdminUsers />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AdminApp;
