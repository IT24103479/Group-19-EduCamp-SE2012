import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import enrollmentService, { type Enrollment } from "../../services/enrollmentService";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from '../../components/Header';
import { API_BASE } from "../../lib/api";

export default function MyClasses() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Guest/lookup states
  const [studentIdInput, setStudentIdInput] = useState<string>("");
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [guestEnrollments, setGuestEnrollments] = useState<Enrollment[]>([]);
  const [lookupDone, setLookupDone] = useState(false);

  // Map of classId => class info (if classes endpoint returns more than price/title)
  const [classesMap, setClassesMap] = useState<Record<string | number, any>>({});

  // Load enrollments for logged-in user
  useEffect(() => {
    if (!user?.id) {
      setEnrollments([]);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    enrollmentService
      .getByUserId(user.id)
      .then((data) => {
        if (!mounted) return;
        console.log('[enrollments] getByUserId response:', data);
        setEnrollments(data ?? []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message ?? "Failed to load enrollments");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Whenever either set of enrollments changes, fetch classes list once and build a map
  useEffect(() => {
    const allEnrollments = [...enrollments, ...guestEnrollments];
    const classIds = Array.from(new Set(allEnrollments.map((e) => String(e.classId))));

    if (classIds.length === 0) {
      setClassesMap({});
      return;
    }

    let mounted = true;
    // Fetch all classes (the backend in other parts of this app exposes /classes)
    axios
      .get(`${API_BASE}/classes`)
      .then((res) => {
        if (!mounted) return;
        const classes: any[] = res.data ?? [];
        const map: Record<string | number, any> = {};
        classes.forEach((c) => {
          map[String(c.id ?? c.class_id ?? c.id)] = c;
        });
        console.log('[classes] fetch response:', map);
        setClassesMap(map);
      })
      .catch(() => {
        if (!mounted) return;
        // on failure we just keep classesMap empty; enrollment list will still show IDs
        setClassesMap({});
        
      });


    return () => {
      mounted = false;
    };
  }, [enrollments, guestEnrollments]);

  // Guest lookup handler: fetch enrollments by student id
  const handleGuestLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setGuestError(null);
    setGuestEnrollments([]);
    setLookupDone(false);

    const trimmed = studentIdInput.trim();
    if (!trimmed) {
      setGuestError("Please enter a student id.");
      return;
    }
    const sid = Number(trimmed);
    if (!Number.isFinite(sid) || sid <= 0) {
      setGuestError("Student id must be a positive number.");
      return;
    }

    setGuestLoading(true);
    try {
      // Try the specific student endpoint used by the backend: /api/enrollments/student/{studentId}
      const res = await axios.get<Enrollment[]>(
        `${API_BASE}/api/enrollments/student/${sid}`
      );
      const data = res.data ?? [];
      setGuestEnrollments(data);
      setLookupDone(true);
      console.log('[enrollments] fetch response:', data);
    } catch (err: any) {
      // Provide a helpful message and include any server message if present
      setGuestError(err?.response?.data?.message ?? err?.message ?? "Failed to fetch enrollments for student");
      console.error('[enrollments] fetch error:', err);
    } finally {
      setGuestLoading(false);
      
    }
  };

  // Render helper to show class title or fallback to class id
  const renderClassTitle = (classId: number | string) => {
    const c = classesMap[String(classId)];
    if (!c) return `Class ID: ${classId}`;
    // prefer title/name fields commonly returned
    return c.name ?? c.title ?? c.className ?? `Class ${classId}`;
  };

  // Which enrollments to show: logged-in user's enrollments if present, otherwise guest lookup results (if done)
  const showEnrollments = user?.id ? enrollments : lookupDone ? guestEnrollments : [];

  return (
     <>
      {/* Render Header here so it appears on top of the page */}
      <Header />
    
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">My Classes</h1>

      {!user?.id && (
        <div className="mb-6 grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-300 text-yellow-700">
            You are not logged in. If you want to see your enrollments, either log in or enter your Student ID below.
          </div>

          <div className="bg-white p-4 rounded border shadow-sm">
            <form onSubmit={handleGuestLookup} className="flex flex-col gap-3">
              <label className="text-sm font-medium">
                Student ID
                <input
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  className="mt-1 block w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  placeholder="Enter numeric student id"
                />
              </label>

              {guestError && <div className="text-red-600 text-sm">{guestError}</div>}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={guestLoading}
                  className="px-4 py-2 rounded bg-sky-500 hover:bg-sky-600 text-white"
                >
                  {guestLoading ? "Looking up…" : "Lookup Student"}
                </button>

                <button
                  type="button"
                  onClick={() => (window.location.href = "/login")}
                  className="px-4 py-2 rounded bg-sky-100 text-sky-700 border"
                >
                  Login
                </button>
              </div>

              <p className="text-xs text-gray-500">
                The lookup uses the Student ID to fetch enrollments from the backend. Class titles will be shown when available.
              </p>
            </form>
          </div>
        </div>
      )}

      {user?.id && (
        <div>
          {loading && <div className="text-gray-600">Loading your enrollments…</div>}

          {error && <div className="text-red-600">{error}</div>}

          {!loading && enrollments.length === 0 && (
            <div className="p-4 bg-gray-50 border rounded">You have no enrollments yet.</div>
          )}

          {!loading && enrollments.length > 0 && (
            <ul className="space-y-3 mt-4">
              {enrollments.map((e) => (
                <li key={e.id} className="p-4 bg-white border rounded shadow-sm flex items-center justify-between">
                  <div>
                    <div className="font-medium">{renderClassTitle(e.classId)}</div>
                    <div className="text-sm text-gray-600">Payment ID: {e.paymentId}</div>
                    {e.classTitle && <div className="text-sm text-gray-700 mt-1">{e.classTitle}</div>}
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/classes/${e.classId}`} className="px-3 py-1 rounded border text-sm">
                      View class
                    </Link>
                    <button
                      onClick={() => {
                        enrollmentService
                          .getById(e.id as any)
                          .then((full) => {
                            const w = window.open();
                            if (w) {
                              w.document.write(`<pre>${JSON.stringify(full, null, 2)}</pre>`);
                            }
                          })
                          .catch((err) => alert(err?.message ?? "Failed to fetch"));
                      }}
                      className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                    >
                      Details
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Guest lookup results */}
      {!user?.id && lookupDone && (
        <div className="mt-6">
          {guestLoading && <div className="text-gray-600">Loading enrollments…</div>}

          {!guestLoading && guestEnrollments.length === 0 && (
            <div className="p-4 bg-gray-50 border rounded">No enrollments found for this student id.</div>
          )}

          {!guestLoading && guestEnrollments.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3">Enrollments for Student {studentIdInput}</h2>
              <ul className="space-y-3">
                {guestEnrollments.map((e) => (
                  <li key={e.id} className="p-4 bg-white border rounded shadow-sm flex items-center justify-between">
                    <div>
                      <div className="font-medium">{renderClassTitle(e.classId)}</div>
                      <div className="text-sm text-gray-600">Payment ID: {e.paymentId}</div>
                      {e.classTitle && <div className="text-sm text-gray-700 mt-1">{e.classTitle}</div>}
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/classes`} className="px-3 py-1 rounded border text-sm">
                        View class
                      </Link>
                      <button
                        onClick={() => {
                          axios
                            .get(`${API_BASE}/classes`)
                            .then((res) => {
                              const w = window.open();
                              if (w) w.document.write(`<pre>${JSON.stringify(res.data, null, 2)}</pre>`);
                            })
                            .catch((err) => alert(err?.message ?? "Failed to fetch"));
                        }}
                        className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                      >
                        Details
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}