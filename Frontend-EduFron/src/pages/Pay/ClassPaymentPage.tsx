import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ClassPayment from "../../components/Enroll/ClassPayment";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import Header from '../../components/Header';

interface LocationState {
  classId?: number | string;
}

const ClassPaymentPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const classIdRaw = state?.classId;
  const classIdStr = classIdRaw !== undefined && classIdRaw !== null ? String(classIdRaw) : undefined;

  // Prefer auth user from context, but fall back to any persisted user in localStorage
  const auth = useAuth();
  const ctxUser = (auth as any)?.user;
  let storedUser: any = null;
  try {
    storedUser = localStorage.getItem("user") ? JSON.parse(String(localStorage.getItem("user"))) : null;
  } catch (e) {
    storedUser = null;
  }
  const user = ctxUser ?? storedUser ?? null;

  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!classIdStr) return;

    setLoading(true);
    setError("");

    axios
      .get("VITE_BACKEND_URL/classes")
      .then((res) => {
        console.log("classes API response:", res.data);

        const list = Array.isArray(res.data) ? res.data : [];

        // Find by any common id field (class_id, id, classId, _id, etc.) — compare as strings
        const found = list.find((cls: any) => {
          const candidateId =
            cls.class_id ?? cls.id ?? cls.classId ?? cls._id ?? cls.ID ?? cls.ClassId;
          return String(candidateId) === classIdStr;
        });

        if (found) {
          // backend uses `fee` in your log — accept fee, price or amount
          const foundAmount = found.fee ?? found.price ?? found.amount ?? found.cost ?? "";
          setAmount(String(foundAmount ?? ""));
        } else {
          setError("Class not found.");
        }
      })
      .catch((err) => {
        console.error("Error fetching class info:", err);
        setError("Error fetching class info.");
      })
      .finally(() => setLoading(false));
  }, [classIdStr]);

  // If no classId in location.state
  if (!classIdStr) {
    return <div className="p-8 text-red-500">No class selected for payment.</div>;
  }

  // If still loading show a small loader (but allow logged-in user to see payment UI immediately if you prefer)
  if (loading && !user) {
    // If not logged in, we block until we know class exists (you can change this behaviour)
    return <div className="p-8 text-slate-500">Loading class info...</div>;
  }

  // If fetch produced an error and there's no user to show payment for, show the error
  if (error && !user) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  // If user not available both in context and localStorage, prompt login
  if (!user) {
    return <div className="p-8 text-red-500">Please login first.</div>;
  }

  // logged-in user: show payment UI (ClassPayment)
  return (
    <>
      <Header />
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-6">Class Payment</h2>

      <div className="w-full max-w-2xl bg-white shadow rounded p-6">
        <ClassPayment userId={Number((user as any).id)} classId={classIdStr} amount={amount} />

        {/* show background fetch status so user sees if the price is still loading or errored */}
        {loading && <p className="mt-4 text-sm text-slate-500">Loading class details…</p>}
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </div>
    </>
  );
};

export default ClassPaymentPage;