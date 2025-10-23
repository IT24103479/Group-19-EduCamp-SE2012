import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ClassCard from "../components/ClassCard";
import { Search, Filter } from "lucide-react";
import { subjectImages } from "../utils/subjectImages";

export interface Subject { id: number; name: string; }
export interface Teacher { id: number; name: string; }
export interface ClassItem {
  class_id?: number;
  grade: string;
  fee: number;
  timetable: string;
  teacher: Teacher;
  subjects: Subject[];
  id: number;
}

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("http://localhost:8080/classes");
        let data = await res.json();
        data = data.map((c: any) => ({ ...c, id: c.class_id }));
        setClasses(data);
        setFilteredClasses(data);
      } catch (err) { console.error(err); }
    };
    fetchClasses();
  }, []);

  const handleSearch = () => {
    if (!searchTerm || !filterType) { setFilteredClasses(classes); return; }
    const filtered = classes.filter((cls) => {
      if (filterType === "grade") return cls.grade.toLowerCase().includes(searchTerm.toLowerCase());
      if (filterType === "teacher") return cls.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (filterType === "subject") return cls.subjects?.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return false;
    });
    setFilteredClasses(filtered);
  };

  const handleEnroll = (classId: number) => alert(`Enrolled in class ID: ${classId}`);

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

        {/* Search & Filter */}
        <div className="flex gap-4 mb-8 flex-col md:flex-row">
          <div className="relative w-full md:w-1/4">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="" disabled>Select a filter</option>
              <option value="grade">Grade</option>
              <option value="teacher">Teacher</option>
              <option value="subject">Subject</option>
            </select>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
              onKeyDown={(e) => { if(e.key === "Enter") handleSearch(); }}
            />
          </div>

          <button
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            onClick={handleSearch}
          >
            <Search className="w-4 h-4 text-white" /> Search
          </button>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClasses.map((cls, index) => {
            const subjectName = cls.subjects[0]?.name || "default";
            const imageUrl = subjectImages[subjectName];

            return (
              <ClassCard
                key={cls.id}
                index={index}
                classItem={{
                  class_id: cls.id,
                  name: `${cls.grade} - ${subjectName}`,
                  type: subjectName,
                  description: `Teacher: ${cls.teacher?.name}\nSchedule: ${cls.timetable}\n`,
                  image: imageUrl,
                  schedule: cls.timetable,
                  price: cls.fee,
                }}
                onEnroll={handleEnroll}
              />
            );
          })}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-lg">
            No classes found matching your criteria.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Classes;
