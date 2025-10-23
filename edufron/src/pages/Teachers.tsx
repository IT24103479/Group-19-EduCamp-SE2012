import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TeacherCard from "../components/TeacherCard";
import { Search, Filter } from "lucide-react";

interface Subject {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  name: string;
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

  useEffect(() => {
    fetch("http://localhost:8080/teachers")
      .then((res) => res.json())
      .then((data: Teacher[]) => {
        setTeachers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching teachers:", err);
        setLoading(false);
      });
  }, []);

  const subjects = ["all", ...Array.from(new Set(teachers.map((t) => t.subject?.name).filter(Boolean)))];

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject =
      selectedSubject === "all" ||
      teacher.subject?.name?.toLowerCase() === selectedSubject.toLowerCase();

    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Our Expert Teachers</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Meet our dedicated team of qualified educators committed to your academic success.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search box with white background */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search teachers or subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Filter dropdown */}
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

        {/* Teacher Grid */}
        {loading ? (
          <div className="text-center py-12">Loading teachers...</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No teachers found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} index={teacher.id} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Teachers;
