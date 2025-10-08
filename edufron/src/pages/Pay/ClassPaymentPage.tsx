import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ClassPayment from "../../components/Enroll/ClassPayment";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const ClassPaymentPage: React.FC = () => {
  const location = useLocation();
  const classId = location.state?.classId;
 const { user } = useAuth();
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    axios.get("http://localhost:8081/classes")
      .then(res => {
        const found = res.data.find((cls: any) => cls.id === classId);
        if (found) {
          setAmount(found.price);
        } else {
          setError("Class not found.");
        }
      })
      .catch(() => setError("Error fetching class info."))
      .finally(() => setLoading(false));
  }, [classId]);

  if (!classId) {
    return <div className="p-8 text-red-500">No class selected for payment.</div>;
  }
  if (loading) {
    return <div className="p-8 text-slate-500">Loading class info...</div>;
  }
  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }
  
  if (!user) return <div>Please login first.</div>;

return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <h2 className="text-2xl font-bold mb-6">Class Payment</h2>
    {user && classId ? (
      <ClassPayment
        userId={Number(user.id)}
        classId={classId}
        amount={amount}
      />
    ) : (
      <div className="text-red-500">Please login or select a class.</div>
    )}
  </div>
);
};

export default ClassPaymentPage;
