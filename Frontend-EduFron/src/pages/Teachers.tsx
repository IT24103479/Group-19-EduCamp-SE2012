import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TeacherCard from "../components/TeacherCard";
import { Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface Subject {
  id: number;
  name: string;
}

export interface Teacher {
  id: number;
  firstName?: string;
  lastName?: string;
  name?: string; // fallback for combined name
  subject?: Subject | null;
  email?: string;
  phone?: string;
  address?: string;
  qualification?: string;
  b_day?: string;
  j_date?: string;
  image?: string;
}

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  function getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  function getSessionHeader(): Record<string, string> {
    const sessionId = localStorage.getItem("sessionId");
    return sessionId ? { "X-Session-Id": sessionId } : {};
  }

  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...getSessionHeader(),
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/teachers", { headers });
        const data = await res.json();
        console.log("Fetched teachers:", data);

        // 🚨 Handle unauthorized
        if (data.success === false && data.message === "Not authenticated") {
          console.warn("User not authenticated. Redirect to login...");
          
        }

        let teacherList: any[] = [];

        //  Handle { success: true, teachers: [...] }
        if (data.success && Array.isArray(data.teachers)) {
          teacherList = data.teachers;
        }
        //  Fallback for plain arrays or wrapped in data.data
        else if (Array.isArray(data)) {
          teacherList = data;
        } else if (Array.isArray(data.data)) {
          teacherList = data.data;
        } else {
          console.error("Unexpected teacher data format:", data);
          teacherList = [];
        }

        // 🧩 Normalize teacher fields
        const formatted = teacherList.map((t: any) => ({
          id: t.id ?? t.teacher_id ?? 0,
          firstName: t.firstName ?? t.first_name ?? "",
          lastName: t.lastName ?? t.last_name ?? "",
          name:
            t.name ??
            `${t.firstName ?? t.first_name ?? ""} ${t.lastName ?? t.last_name ?? ""}`.trim(),
          subject: t.subject ?? null,
          email: t.email ?? "",
          phone: t.phoneNumber ?? t.phone ?? "",
          address: t.address ?? "",
          qualification: t.qualification ?? "",
          b_day: t.b_day ?? "",
          j_date: t.j_date ?? "",
          image: t.image ?? "",
        }));

        setTeachers(formatted);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  //  Get unique subject names
  const subjects = [
    "all",
    ...Array.from(new Set(teachers.map((t) => t.subject?.name).filter(Boolean))),
  ];

  // 🔍 Apply filtering
  const filteredTeachers = teachers.filter((teacher) => {
    const subjectName = teacher.subject?.name?.toLowerCase() ?? "";
    const teacherName =
      teacher.name?.toLowerCase() ??
      `${teacher.firstName ?? ""} ${teacher.lastName ?? ""}`.toLowerCase();

    const matchesSearch =
      teacherName.includes(searchTerm.toLowerCase()) ||
      subjectName.includes(searchTerm.toLowerCase());

    const matchesSubject =
      selectedSubject === "all" ||
      subjectName === selectedSubject.toLowerCase();

    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Our Expert Teachers
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Meet our dedicated team of qualified educators committed to your
            academic success.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search teachers or subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="pl-10 pr-8 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject === "all" ? "All Subjects" : subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        {loading ? (
          <div className="text-center py-12">Loading teachers...</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">
              No teachers found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeachers.map((teacher, index) => (
              <TeacherCard key={teacher.id} teacher={teacher} index={index} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Teachers;
