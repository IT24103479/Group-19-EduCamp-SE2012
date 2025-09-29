// src/App.tsx
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
import Subjects from './pages/Subjects';
import Classes from './pages/Classes';
import Teachers from './pages/Teachers';
import AdminDashboard from './pages/AdminDashboard'; // ✅ Add AdminDashboard
import ClassRecords from './pages/ClassRecords';     // ✅ Add ClassRecords

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
            <Route path="/classes" element={<Classes />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* Admin only */}
            <Route path="/class-records" element={<ClassRecords />} />     {/* Admin class records */}
            <Route path="*" element={<NotFound />} />
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
