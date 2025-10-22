import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface Material {
  id: number;
  title: string;
  description: string;
  subject: string;
  className: string;
  fileName: string;
}

const ViewResources: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("all");

  // 🔹 Fetch materials from backend
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/materials")
      .then((response) => {
        setMaterials(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching materials:", error);
        setLoading(false);
      });
  }, []);

  // 🔹 Filter materials by selected subject
  const filteredMaterials =
    selectedSubject === "all"
      ? materials
      : materials.filter((m) => m.subject === selectedSubject);

  // 🔹 Loading and empty states
  if (loading)
    return (
      <div className="text-center mt-10 text-slate-600 text-lg">
        Loading materials...
      </div>
    );

  if (materials.length === 0)
    return (
      <div className="text-center mt-10 text-slate-600 text-lg">
        No materials found.
      </div>
    );

  return (
    <>
      <Header />

      <div className="p-6 min-h-screen bg-gray-50">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 text-center">
          📚 Teacher Materials
        </h2>

        {/* 🔽 Subject filter dropdown */}
        <div className="flex justify-center mb-6">
          <label className="mr-2 font-semibold">Filter by Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border p-2 rounded focus:ring-2 focus:ring-emerald-400"
          >
            <option value="all">All Subjects</option>
            {Array.from(new Set(materials.map((m) => m.subject))).map(
              (subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              )
            )}
          </select>
        </div>

        {/* 🔽 Material cards */}
        {filteredMaterials.length === 0 ? (
          <p className="text-center text-slate-600">
            No materials available for this subject.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="p-4 rounded-2xl shadow-md bg-white border hover:shadow-lg transition"
              >
                <h3 className="text-lg font-bold text-emerald-700">
                  {material.title}
                </h3>
                <p className="text-slate-600 mt-1">{material.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  <strong>Subject:</strong> {material.subject || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Class:</strong> {material.className || "N/A"}
                </p>
                <a
                  href={`http://localhost:8080/api/materials/${material.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-white bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default ViewResources;
