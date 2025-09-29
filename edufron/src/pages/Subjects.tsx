import React, { useEffect, useState } from "react";
import axios from "axios";
import SubjectCard from "../components/SubjectCard";
import { subjectImages } from "../utils/subjectImages";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface Subject {
  id: number;
  name: string;
}

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);

  // Fetch subjects from backend
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get<Subject[]>("http://localhost:8080/subjects");
        setSubjects(res.data);
        setFilteredSubjects(res.data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, []);

  // Search handler
  const handleSearch = () => {
    const filtered = subjects.filter((subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubjects(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="p-8">
        <h1 className="text-4xl font-bold text-center mb-8">Subjects</h1>

        {/* Search Bar */}
        <div className="flex justify-center mb-8 gap-4">
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className="flex flex-col">
              <SubjectCard
                name={subject.name}
                image={subjectImages[subject.name] || subjectImages["default"]}
              />
              <button
                className="mt-2 bg-blue-600 text-white py-1 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => alert(`View details for ${subject.name}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No subjects found.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Subjects;
