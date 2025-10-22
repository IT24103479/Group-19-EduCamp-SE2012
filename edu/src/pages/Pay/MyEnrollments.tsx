import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import enrollmentService, { type Enrollment } from "../../services/enrollmentService";

const MyEnrollments: React.FC = () => {
  const { user } = useAuth() as any;
  const navigate = useNavigate();

  // fallback to localStorage user if auth context isn't populated yet
  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const effectiveUser = user ?? getStoredUser();
  const userId = effectiveUser?.id;

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchEnrollments = async () => {
  try {
    const data = await enrollmentService.getMyEnrollments(); // <-- use session-based endpoint
    setEnrollments(Array.isArray(data) ? data : []);
  } catch (err: any) {
    console.error("[MyEnrollments] fetch error:", err);
    setError(String(err?.message ?? err));
  } finally {
    setLoading(false);
  }
};

fetchEnrollments();

    enrollmentService.getByUserId(userId)
      .then((data) => {
        if (!cancelled) {
          setEnrollments(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        console.error("[MyEnrollments] fetch error:", err);
        if (!cancelled) setError(String(err?.message ?? err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [userId]);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="bg-white shadow rounded p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-4">Your Enrollments</h2>
          <p className="mb-4 text-gray-600">You must be logged in to view your enrollments.</p>
          <div className="flex gap-3 justify-center">
            <button
              className="px-4 py-2 rounded bg-sky-500 text-white hover:bg-sky-600"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">My Enrollments</h1>

        {loading ? (
          <div className="text-slate-500">Loading your enrollments...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : enrollments.length === 0 ? (
          <div className="text-slate-600">You have no enrollments yet.</div>
        ) : (
          <div className="grid gap-6">
            {enrollments.map((e) => {
              const className = e.className ?? e.name ?? `Class #${e.classId}`;
              const status = e.status ?? (e.enrollmentStatus ?? "ENROLLED");
              const enrolledAt = e.enrolledAt ?? e.enrollmentDate ?? e.enrolled_date ?? "";
              const amount = e.amount ?? e.fee ?? "";
              return (
                <div key={e.id} className="bg-white shadow rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{className}</h2>
                    <p className="text-sm text-gray-600">Class ID: {e.classId}</p>
                    {enrolledAt && <p className="text-sm text-gray-600">Enrolled: {new Date(enrolledAt).toLocaleString()}</p>}
                    {amount !== "" && <p className="text-sm font-medium mt-2">Fee: Rs. {amount}</p>}
                  </div>

                  <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${status === 'ENROLLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {status}
                    </span>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => navigate(`/classes/${e.classId}`)}
                        className="px-3 py-1 bg-sky-500 text-white rounded hover:bg-sky-600"
                      >
                        View class
                      </button>

                      {e.paymentId && (
                        <button
                          onClick={() => navigate(`/payments/${e.paymentId}`)}
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          Payment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEnrollments;