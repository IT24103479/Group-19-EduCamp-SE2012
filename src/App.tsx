import React from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


// Pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Enroll from './pages/Enroll';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Subjects from './pages/Subjects';
import Classes from './pages/Classes';
import Teachers from './pages/Teachers';
import TeacherProfile from './pages/TeacherProfile';
import AdminDashboard from './pages/AdminDashboard';
import ClassRecords from './pages/TeacherRecords';
import TeacherRecords from './pages/TeacherRecords';
import TeacherMaterialForm from "./pages/TeacherMaterialForm";
import TeacherDashboard from './pages/TeacherDashboard';
import AddTeacherForm from "./components/AddTeacherForm";
import AdminSignUp from './pages/AdminSignUp';
import Resources from "./pages/Resources";

const App: React.FC = () => {
  return (
    <Theme appearance="inherit" radius="large" scaling="100%">
      <Router>
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/enroll" element={<Enroll />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/teachers" element={<Teachers />} />  
            <Route path="/teachers/:id" element={<TeacherProfile />} /> 
            <Route path="/admin-teachers" element={<TeacherRecords />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/class-records" element={<ClassRecords />} />
             <Route path="/teacher-upload/:id" element={<TeacherMaterialForm />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/register-teacher" element={<AddTeacherForm />} />
            <Route path="/register/admin" element={<AdminSignUp />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
          />
        </main>
      </Router>
    </Theme>
  );
};

export default App;
