import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ClassCard from "../components/ClassCard";
import { Search, Filter } from "lucide-react";
import { subjectImages } from "../utils/subjectImages"; // map of subject -> image

export interface Subject {
  id: number;
  name: string;
}

export interface Teacher {
  id: number;
  name: string;
}

export interface ClassItem {
  id: number;
  grade: string;
  fee: number;
  timetable: string;
  teacher: Teacher;
  subjects: Subject[];
}

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch classes from backend
  const fetchClasses = async () => {
    try {
      const res = await axios.get<ClassItem[]>("http://localhost:8080/classes");
      setClasses(res.data);
      setFilteredClasses(res.data); // initialize filteredClasses
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Handle search
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

  // Enroll button
  const handleEnroll = (classId: number) => {
    alert(`Enrolled in class ID: ${classId}`);
    // Call backend API to register enrollment here
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
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <button
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClasses.map((cls, index) => {
            const subjectName = cls.subjects[0]?.name || "default";
            const imageUrl = subjectImages[subjectName] || subjectImages["default"];

            return (
              <ClassCard
                key={cls.id}
                index={index}
                classItem={{
                  id: cls.id,
                  name: `${cls.grade} - ${subjectName}`,
                  type: subjectName,
                  description: `Teacher: ${cls.teacher?.name}\nSchedule: ${cls.timetable}\nFee: Rs. ${cls.fee}`,
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
