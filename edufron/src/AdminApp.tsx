import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from './pages/Index';
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClasses from "./pages/admin/AdminClasses";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminProfile from "./pages/admin/AdminProfile";
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';

const queryClient = new QueryClient();

const AdminApp: React.FC = () => {
    return (
  <QueryClientProvider client={queryClient}>
<Theme appearance="inherit" radius="large" scaling="100%">
  <TooltipProvider>
    <Sonner />
<BrowserRouter basename="/admin.html">
  <Routes>
    {/* /admin.html → AdminDashboard */}
    <Route path="/" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
      <Route path="classes" element={<AdminClasses />} />
      <Route path="teachers" element={<AdminTeachers />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="enrollments" element={<AdminEnrollments />} />
      <Route path="profile" element={<AdminProfile />} />
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

        {/* Catch-all must be last */}
       

      

  </TooltipProvider>
</Theme>

  </QueryClientProvider>
      
    );
};

export default AdminApp;
