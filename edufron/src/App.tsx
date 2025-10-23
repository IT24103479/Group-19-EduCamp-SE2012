import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Classes from "./pages/Classes";
import Enroll from "./pages/Enroll";
import NotFound from "./pages/NotFound";
import Subjects from "./pages/Subjects";
import Teachers from "./pages/Teachers";
import ClassPaymentPage from './pages/Pay/ClassPaymentPage';
import EnrolledClasses from './pages/Pay/EnrolledClasses';
import PaymentSuccess from './pages/Pay/PaymentSuccess';
import MyEnrollments from './pages/Pay/MyEnrollments';



const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="classes" element={<Classes />} />
        <Route path="enroll" element={<Enroll />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/class-payment" element={<ClassPaymentPage />} />
            <Route path="/class-payment/:id" element={<ClassPaymentPage />} />
            <Route path="/my-enrollments" element={<MyEnrollments />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
