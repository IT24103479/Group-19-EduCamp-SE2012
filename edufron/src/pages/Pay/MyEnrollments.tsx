import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import enrollmentService, { type Enrollment } from "../../services/enrollmentService";
import Header from '../../components/Header';

type ClassInfo = {
  id: string | number;
  name?: string;
  grade?: string;
};

const MyEnrollments: React.FC = () => {
  const { user } = useAuth() as any;
  const navigate = useNavigate();

  // fallback to localStorage user if auth context isn't populated yet
  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("user");
      console.log("Stored user raw:", raw);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const effectiveUser = user ?? getStoredUser();
  // Prefer explicit studentId from auth if available, otherwise fall back to id
  const studentId = effectiveUser?.studentId ?? effectiveUser?.id;

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [classMap, setClassMap] = useState<Record<string, ClassInfo>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingClasses, setLoadingClasses] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch enrollments for student
  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const fetchEnrollmentsForStudent = async () => {
      try {
        const url = `http://localhost:8081/api/enrollments/student/${encodeURIComponent(
          studentId
        )}`;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (effectiveUser?.token) {
          headers["Authorization"] = `Bearer ${effectiveUser.token}`;
        }

        const res = await fetch(url, {
          method: "GET",
          headers,
          signal: controller.signal,
          credentials: "include",
        });

        if (!res.ok) {
          let msg = `${res.status} ${res.statusText}`;
          try {
            const body = await res.json();
            if (body?.message) msg = body.message;
          } catch {
            /* ignore json parse errors */
          }
          throw new Error(msg);
        }

        const data = await res.json();
        if (!cancelled) {
          setEnrollments(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("[MyEnrollments] fetch error:", err);
        if (!cancelled) setError(String(err?.message ?? err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEnrollmentsForStudent();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [studentId, effectiveUser?.token]);

  // After enrollments are loaded, fetch class details (name, grade) for each unique classId
  useEffect(() => {
    if (!enrollments || enrollments.length === 0) {
      setClassMap({});
      return;
    }

    const uniqueIds = Array.from(new Set(enrollments.map((e) => String(e.classId))));
    if (uniqueIds.length === 0) return;

    let cancelled = false;
    const controller = new AbortController();
    setLoadingClasses(true);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (effectiveUser?.token) {
      headers["Authorization"] = `Bearer ${effectiveUser.token}`;
    }

    const fetchAll = async () => {
      try {
        // fetch class info in parallel
        const promises = uniqueIds.map(async (classId) => {
          const url = `http://localhost:8081/api/enrollments/class/${encodeURIComponent(classId)}`;
          try {
            const res = await fetch(url, {
              method: "GET",
              headers,
              signal: controller.signal,
              credentials: "include",
            });

            if (!res.ok) {
              console.warn(`[MyEnrollments] class ${classId} fetch failed: ${res.status}`);
              return { id: classId, name: undefined, grade: undefined } as ClassInfo;
            }

            const body = await res.json();
            console.log(`[MyEnrollments] class ${classId} fetch body:`, body);

            // The API sometimes returns an array with a single object (as you showed).
            // Normalize to the first item when necessary, then extract name/grade from either top-level or nested classEntity.
            const item = Array.isArray(body) ? body[0] ?? {} : body ?? {};

            const name =
              item?.name ??
              item?.classEntity?.name ??
              item?.className ??
              item?.classEntity?.className ??
              undefined;

            const grade =
              item?.grade ??
              item?.classEntity?.grade ??
              item?.classGrade ??
              item?.classEntity?.classGrade ??
              undefined;

            return {
              id: classId,
              name,
              grade,
            } as ClassInfo;
          } catch (err: any) {
            if (err.name === "AbortError") throw err;
            console.error(`[MyEnrollments] class ${classId} fetch error:`, err);
            return { id: classId, name: undefined, grade: undefined } as ClassInfo;
          }
        });

        const results = await Promise.all(promises);
        if (!cancelled) {
          const map: Record<string, ClassInfo> = {};
          results.forEach((c) => {
            map[String(c.id)] = c;
          });
          setClassMap(map);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("[MyEnrollments] fetch class details error:", err);
        if (!cancelled) setError(String(err?.message ?? err));
      } finally {
        if (!cancelled) setLoadingClasses(false);
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [enrollments, effectiveUser?.token]);

  if (!studentId) {
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
    <>
      <Header />
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">My Enrollments</h1>

{loading ? (
  <div className="bg-gray-100 text-slate-500 border border-gray-300 rounded-xl p-6 w-full text-center shadow-sm">
    Loading your enrollments...
  </div>
) : error ? (
  <div className="bg-gray-100 text-red-500 border border-gray-300 rounded-xl p-6 w-full text-center shadow-sm">
    {error}
  </div>
) : enrollments.length === 0 ? (
  <div className="bg-gray-100 text-slate-600 border border-gray-300 rounded-xl p-6 w-full text-center shadow-sm">
    You have no enrollments yet.
  </div>
        ) : (
          <div className="grid gap-6">
            {enrollments.map((e) => {
              const classIdStr = String(e.classId);
              const classInfo = classMap[classIdStr];
              const className =
                classInfo?.name ??
                e.className ??
                e.name ??
                `Class #${e.classId}`;
              const classGrade = classInfo?.grade ?? e.grade ?? e.classGrade ?? "";
              const status = e.status ?? (e.enrollmentStatus ?? "ENROLLED");
              const enrolledAt = e.enrolledAt ?? e.enrollmentDate ?? e.enrolled_date ?? "";
              const amount = e.amount ?? e.fee ?? "";

              return (
                <div
                  key={e.id}
                  className="bg-white shadow rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between w-full md:w-[800px]"

                >
                  <div>
                    <h2 className="text-xl font-semibold">{className}</h2>
                    {classGrade && (
                      <p className="text-sm text-gray-600">Grade: {classGrade}</p>
                    )}
                    <p className="text-sm text-gray-600">Class ID: {e.classId}</p>
                    {enrolledAt && (
                      <p className="text-sm text-gray-600">
                        Enrolled: {new Date(enrolledAt).toLocaleString()}
                      </p>
                    )}
                    {amount !== "" && (
                      <p className="text-sm font-medium mt-2">Fee: Rs. {amount}</p>
                    )}
                  </div>

                  <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        status === "ENROLLED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {status}
                    </span>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => navigate(`/classes`)}
                        className="px-3 py-1 bg-sky-500 text-white rounded hover:bg-sky-600"
                      >
                        View class
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {loadingClasses && (
              <div className="text-slate-500">Loading class details...</div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default MyEnrollments;