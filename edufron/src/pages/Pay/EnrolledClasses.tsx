import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

interface ClassItem {
  id: number;
  name: string;
  description: string;
  price: number;
  teacher?: string;
  grade?: string;
  type?: string;
  image?: string;
  schedule?: string;
}

interface Payment {
  id: number;
  classId: number;
  userId: number;
  amount: number;
  currency: string;
  paymentCompleted: boolean;
}

const EnrolledClasses: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      console.warn("⚠️ No user found in useAuth() – must login first.");
      return;
    }

    const fetchEnrolledClasses = async () => {
      try {
        setLoading(true);
        console.log("🔍 Fetching enrolled classes for user:", user);

        // ✅ call /me (no ID in path)
        const res = await axios.get("http://localhost:8081/educamp/api/auth/me", {
           withCredentials: true, // ✅ important for sending cookies
        });

        console.log("✅ /auth/me response:", res.data);

        const enrollments: Payment[] = res.data.enrollments || [];
        console.log("📌 Found enrollments:", enrollments);

        if (enrollments.length === 0) {
          console.log("ℹ️ No enrollments for this user.");
          setClasses([]);
          return;
        }

        // ✅ fetch class details for each enrollment
        const classPromises = enrollments.map((enroll) => {
          console.log(`➡️ Fetching class details for classId: ${enroll.classId}`);
          return axios
            .get(`http://localhost:8081/classes/${enroll.classId}`)
            .then((clsRes) => {
              console.log(`✅ Class details for ${enroll.classId}:`, clsRes.data);
              return clsRes.data;
            })
            .catch((err) => {
              console.error(`❌ Failed to fetch class ${enroll.classId}`, err);
              return null;
            });
        });

        const classResults = await Promise.all(classPromises);
        console.log("📦 Final class results:", classResults);

        setClasses(classResults.filter(Boolean));
      } catch (err) {
        console.error("❌ Error fetching enrolled classes:", err);
        setError("Failed to fetch enrolled classes.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledClasses();
  }, [user]);

  if (!user)
    return (
      <div className="p-8 text-red-500">
        Please login to view enrolled classes.
      </div>
    );
  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Enrolled Classes</h2>
      {classes.length === 0 ? (
        <div>You haven’t enrolled in any classes yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white shadow p-4 rounded-lg border"
            >
              <h3 className="text-lg font-semibold">{cls.name}</h3>
              <p className="text-sm text-gray-600">{cls.description}</p>
              {cls.teacher && (
                <p className="mt-2 text-gray-800 font-medium">
                  Teacher: {cls.teacher}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrolledClasses;
