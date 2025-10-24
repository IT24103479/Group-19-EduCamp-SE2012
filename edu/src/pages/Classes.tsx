import React, { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ClassCard from "../components/ClassCard";
import { Search } from "lucide-react";
import { subjectImages } from "../utils/subjectImages";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export interface Subject {
  id: number;
  name: string;
}
export interface Teacher {
  id: number;
  name: string;
}

export interface ClassItem {
  class_id?: number;
  grade: string;
  fee: number;
  timetable: string;
  teacher: Teacher;
  subjects: Subject[];
  id: number;
  imageUrl?: string;
}

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // call hook once
  const auth = useAuth();
  const sessionId = auth?.sessionId ?? localStorage.getItem("sessionId");
  const user = auth?.user;

  // build a normalized lookup for images (case/whitespace tolerant)
  const normalizedSubjectImages = useMemo(() => {
    return Object.fromEntries(
      Object.entries(subjectImages).map(([k, v]) => [k.toLowerCase().trim(), v])
    );
  }, []);

  // Fetch classes from backend
  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      setError(null);

      try {
        const sid = sessionId;
        if (!sid) {
          throw new Error("No session id - please login");
        }

        const res = await fetch("http://localhost:8081/classes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Session-ID": sid,
            "X-Session-Id": sid,
          },
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        let data = await res.json();

        // Map backend shape to frontend ClassItem shape with fallbacks
        const mapped = (Array.isArray(data) ? data : []).map((c: any) => {
          let subjects: Subject[] = [];

          if (Array.isArray(c.subjects)) {
            subjects = c.subjects.map((s: any, i: number) => ({
              id: s?.id ?? i,
              name: s?.name ?? (typeof s === "string" ? s : "") as string,
            }));
            if (
              subjects.length > 0 &&
              (!subjects[0].name || subjects[0].name.trim() === "") &&
              c.name
            ) {
              subjects[0].name = String(c.name);
            }
          } else if (c.subject) {
            subjects = [{ id: c.subject_id ?? 0, name: String(c.subject) }];
          } else if (Array.isArray(c.subjectIds)) {
            subjects = c.subjectIds.map((id: any, i: number) => ({ id: id ?? i, name: "" }));
            if (subjects.length > 0 && c.name) {
              subjects[0].name = String(c.name);
            }
          } else if (c.name) {
            subjects = [{ id: c.subject_id ?? c.class_id ?? c.id ?? 0, name: String(c.name) }];
          }

          const teacher: Teacher = c.teacher
            ? {
                id: c.teacher.id ?? c.teacher_id ?? c.teacherId ?? 0,
                name: c.teacher.name ?? c.teacher_name ?? c.teacherName ?? "",
              }
            : {
                id: c.teacher_id ?? c.teacherId ?? 0,
                name: c.teacher_name ?? c.teacherName ?? c.instructor ?? "",
              };

          const classItem: ClassItem = {
            id: c.id ?? c.class_id ?? 0,
            class_id: c.class_id ?? c.id ?? 0,
            grade: (c.grade ?? c.gradeName ?? "").toString() || (c.name ?? "Unknown").toString(),
            fee: Number(c.fee ?? c.price ?? 0),
            timetable: (c.timetable ?? c.schedule ?? c.time ?? "").toString(),
            teacher,
            subjects,
            imageUrl: c.image ?? (c.imageUrl ?? undefined),
          };

          return classItem;
        });

        setClasses(mapped);
        setFilteredClasses(mapped);
      } catch (err: any) {
        console.error("Error fetching classes:", err);
        setError(err?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [sessionId]);

  // Apply filter on search button click
  const handleSearch = () => {
    if (!searchTerm) {
      setFilteredClasses(classes);
      return;
    }

    const filtered = classes.filter((cls) => {
      const teacherName = cls.teacher?.name ?? "";
      const subjectNames = cls.subjects?.map((s) => s.name.toLowerCase()) ?? [];
      return (
        cls.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subjectNames.some((s) => s.includes(searchTerm.toLowerCase()))
      );
    });

    setFilteredClasses(filtered);
  };

  // navigate to class_payment when enroll is clicked, using location.state
  const onEnroll = (classId: number) => {
    if (!classId) return;
    // pass classId via location state
    navigate("/class-payment", { state: { classId } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Browse Classes</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Search and enroll in our available classes
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by grade, teacher or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>

          <button
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            onClick={handleSearch}
          >
            <Search className="w-4 h-4 text-white" />
            Search
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading classes...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">Error: {error}</div>
        ) : (
          <>
            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredClasses.map((cls, index) => {
                const subjectNameRaw = cls.subjects?.[0]?.name || (cls as any).name || "default";
                const subjectKey = String(subjectNameRaw).toLowerCase().trim();

                const imageUrl =
                  cls.imageUrl ??
                  normalizedSubjectImages[subjectKey] ??
                  subjectImages[subjectNameRaw] ??
                  subjectImages["English"] ??
                  subjectImages["default"];

                return (
                  <ClassCard
                    key={cls.id}
                    index={index}
                    classItem={{
                      class_id: cls.class_id,
                      name: subjectNameRaw,
                      type: subjectNameRaw,
                      description: `Grade: ${cls.grade}\nTeacher: ${cls.teacher?.name}\nSchedule: ${cls.timetable}\n`,
                      imageUrl: cls.imageUrl,
                      schedule: cls.timetable,
                      price: cls.fee,
                    }}
                    onEnroll={onEnroll}
                  />
                );
              })}
            </div>

            {filteredClasses.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-lg">
                No classes found matching your criteria.
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Classes;