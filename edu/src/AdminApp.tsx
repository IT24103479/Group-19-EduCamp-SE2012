import { BrowserRouter, Routes, Route } from "react-router-dom";
import {  useState } from "react";
import { Toaster as Sonner } from "./components/ui/sonner";
import { Button } from "./components/ui/button";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from './pages/Index';
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClasses from "./pages/admin/AdminClasses";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import ClassRecords from "./pages/admin/ClassRecords";
import AdminProfile from "./pages/admin/AdminProfile";
import NotFound from './pages/NotFound';
import Login from './pages/Login';

import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';

const queryClient = new QueryClient();


const AdminApp: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <Theme appearance="inherit" radius="large" scaling="100%">
        <TooltipProvider>
          <Sonner />

          <BrowserRouter basename="/admin">
            {/* Button to open profile modal */}

            {/* Routes must only contain Route components */}
            <Routes>
              <Route path="/*" element={<AdminLayout />}>
              
                <Route index element={<AdminDashboard />} />
                <Route path="classes" element={<ClassRecords />} />
                <Route path="teachers" element={<AdminTeachers />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="enrollments" element={<AdminEnrollments />} />

                <Route path="*" element={<AdminDashboard />} />
              </Route>
              <Route path="*" element={<AdminDashboard />} />
            </Routes>

            <ToastContainer
              position="top-right"
              autoClose={3000}
              newestOnTop
              closeOnClick
              pauseOnHover
            />
          </BrowserRouter>
        </TooltipProvider>
      </Theme>
    </QueryClientProvider>
  );
};


export default AdminApp;
