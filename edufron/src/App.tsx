import React from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Enroll from './pages/Enroll';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdminSignUp from './pages/AdminSignUp';
import Subjects from './pages/Subjects';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import StudentDashboard from './pages/StudentDashboard';
import Profile from './pages/Profile';
import Submissions from './pages/Submissions';
import AddTeacherForm from './pages/AddTeacherForm';
import TeacherRecords from './pages/TeacherRecords';
import TeacherAssignments from './pages/TeacherAssignments';
import TeacherDashboard from './pages/TeacherDashboard';
import Resources from './pages/Resources';

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
            <Route path="/register/admin" element={<AdminSignUp />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/submissions" element={<Submissions />} />
            <Route path="/register/teacher" element={<AddTeacherForm />} />
            <Route path="/admin-teachers" element={<TeacherRecords/>} />
            <Route path="/TeacherAssignments" element={<TeacherAssignments/>} />
            <Route path="/TeacherDashboard" element={<TeacherDashboard/>} />
            <Route path="/Resources" element={<Resources/>} />
          </Routes>

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
