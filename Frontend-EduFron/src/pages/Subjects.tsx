import React, { useEffect, useState } from "react";
import axios from "axios";
import SubjectCard from "../components/SubjectCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { subjectImages } from "../utils/subjectImages";

interface Subject {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

interface ClassItem {
  id: number;
  grade: string;
  fee: number;
  timetable: string;
  teacher: Teacher | null;
  subjects: Subject[];
}

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get<Subject[]>("http://localhost:8081/subjects");
        setSubjects(res.data);
        setFilteredSubjects(res.data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, []);

  const handleSearch = () => {
    const filtered = subjects.filter((subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubjects(filtered);
  };

  // Open modal and fetch only classes for this subject
  const openModal = async (subject: Subject) => {
    setSelectedSubject(subject);
    setModalOpen(true);
    setLoading(true);
    try {
      const res = await axios.get<ClassItem[]>("http://localhost:8081/classes");
      // Map backend teacher data correctly
      const mappedClasses = res.data.map((cls) => ({
        ...cls,
        teacher: cls.teacher
          ? { id: cls.teacher.id, firstName: cls.teacher.firstName, lastName: cls.teacher.lastName }
          : null,
        subjects: cls.subjects ?? [],
        id: cls.id ?? cls.id ?? 0,
      }));
      const filtered = mappedClasses.filter((cls) =>
        cls.subjects.some((s) => s.id === subject.id)
      );
      setClasses(filtered);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSubject(null);
    setClasses([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="p-8">
        <h1 className="text-4xl font-bold text-center mb-8">Subjects</h1>

        {/* Search */}
        <div className="flex justify-center mb-8 gap-4">
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 focus:border-transparent"
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
                image={subjectImages[subject.name]}
              />
              <button
                className="mt-2 bg-green-600 text-white py-1 rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => openModal(subject)}
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

        {/* Modal */}
        {modalOpen && selectedSubject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full relative">
              <button
                className="absolute top-2 right-2 text-red-600 font-bold text-xl hover:text-red-800"
                onClick={closeModal}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4">{selectedSubject.name} Classes</h2>
              {loading ? (
                <p>Loading classes...</p>
              ) : classes.length === 0 ? (
                <p>No classes found for this subject.</p>
              ) : (
                <table className="w-full border rounded">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Grade</th>
                      <th className="px-4 py-2 text-left">Teacher</th>
                      <th className="px-4 py-2 text-left">Fee</th>
                      <th className="px-4 py-2 text-left">Timetable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((cls) => (
                      <tr key={cls.id} className="border-t">
                        <td className="px-4 py-2">{cls.grade}</td>
                        <td className="px-4 py-2">
                          {cls.teacher
                            ? `${cls.teacher.firstName} ${cls.teacher.lastName}`
                            : "No teacher"}
                        </td>
                        <td className="px-4 py-2">{cls.fee}</td>
                        <td className="px-4 py-2">{cls.timetable}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Subjects;