import React from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./contexts/AuthContext";
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Enroll from './pages/Enroll';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Subjects from './pages/Subjects';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import StudentDashboard from './pages/Student/StudentDashboard';
import Profile from './pages/Student/Profile';
import ClassPaymentPage from './pages/Pay/ClassPaymentPage';
import EnrolledClasses from './pages/Pay/EnrolledClasses';
import PaymentSuccess from './pages/Pay/PaymentSuccess';
//import UserProfile from './pages/UserProfile';


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
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/class-payment" element={<ClassPaymentPage />} />
            <Route path="/enrolled-classes" element={<EnrolledClasses />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
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

