import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BrowseClassPage() {
  const [classes, setClasses] = useState([]);
  const [searchInput, setSearchInput] = useState(""); // typed input
  const [filteredClasses, setFilteredClasses] = useState([]); // filtered results
  const navigate = useNavigate();

  // Fetch all classes from backend
  const fetchClasses = () => {
    axios
      .get("http://localhost:8080/classes")
      .then((res) => {
        setClasses(res.data);
        setFilteredClasses(res.data); // show all initially
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Handle search button click
  const handleSearch = () => {
    const filtered = classes.filter(
      (c) =>
        c.grade.toLowerCase().includes(searchInput.toLowerCase()) ||
        c.teacher?.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
        c.subjects?.some((s) => s.name.toLowerCase().includes(searchInput.toLowerCase()))
    );
    setFilteredClasses(filtered);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Browse Classes</h1>

      {/* Search bar with button */}
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search by grade, teacher, or subject..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border p-2 rounded flex-grow"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 ml-2 rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {/* Display filtered classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((c) => (
          <div
            key={c.class_id}
            className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-50"
            onClick={() => navigate(`/class-details/${c.class_id}`)}
          >
            <h2 className="text-xl font-semibold">{c.grade}</h2>
            <p><strong>Teacher:</strong> {c.teacher?.name}</p>
            <p>
              <strong>Subjects:</strong>{" "}
              {c.subjects?.map((s) => s.name).join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrowseClassPage;
