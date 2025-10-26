import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_BASE } from "../../lib/api";

interface Material {
  id: number;
  title: string;
  description: string;
  subject: string;
  className: string;
  fileUrl: string;
  fileName?: string;
}

const TeacherMaterialForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Fetch uploaded materials
  const fetchMaterials = async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`${API_BASE}/api/materials`, {
        method: "GET",
        credentials: "include", // send cookies with request
        signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Failed to fetch materials: ${response.status} ${text}`);
      }

      const data = await response.json();
      console.log("Fetched materials:", data);
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error(err);
      toast.error("Failed to load materials");
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchMaterials(controller.signal);
    return () => controller.abort();
  }, []);

  // Handle upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !className || !file) {
      toast.error("Please fill all required fields and select a file");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const result = reader.result as string;
        const base64File = result.split(",")[1] ?? ""; // remove prefix if present
        const payload = {
          title,
          description,
          subject,
          className,
          fileName: file.name,
          fileData: base64File,
        };
        console.log("Upload payload:", { ...payload, fileData: "[base64]" });

        const response = await fetch(`${API_BASE}/api/materials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // send session cookie
          body: JSON.stringify(payload),
        });

        console.log("Upload response status:", response.status);

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          throw new Error(`Upload failed: ${response.status} ${text}`);
        }

        toast.success("Material uploaded successfully!");
        setTitle("");
        setDescription("");
        setSubject("");
        setClassName("");
        setFile(null);
        // refresh list
        fetchMaterials();
      } catch (err) {
        console.error(err);
        toast.error("Upload failed!");
      }
    };

    reader.onerror = (err) => {
      console.error("File read error", err);
      toast.error("Failed to read file");
    };
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;

    try {
      const response = await fetch(`${API_BASE}/api/materials/${id}`, {
        method: "DELETE",
        credentials: "include", // send cookie too
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Delete failed: ${response.status} ${text}`);
      }

      toast.success("Material deleted successfully!");
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Delete failed!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-emerald-700">Upload Teaching Materials</h2>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Title</label>
          <input
            placeholder="Title*"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">-- Choose Subject --</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="ICT">ICT</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Class</label>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">-- Choose Grade --</option>
            <option value="Grade 6">Grade 6</option>
            <option value="Grade 7">Grade 7</option>
            <option value="Grade 8">Grade 8</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Select File*</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 text-white py-2 rounded hover:bg-emerald-600"
        >
          Upload File
        </button>
      </form>

      {/* Uploaded Files */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Uploaded Materials</h3>
        {materials.length === 0 ? (
          <p className="text-gray-500">No materials uploaded yet.</p>
        ) : (
          <ul className="space-y-3">
            {materials.map((m) => (
              <li
                key={m.id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded shadow-sm"
              >
                <div>
                  <p className="font-semibold">{m.title}</p>
                  <p className="text-sm text-gray-600">
                    {m.subject} | {m.className}
                  </p>
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline text-sm"
                  >
                    View / Download File
                  </a>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TeacherMaterialForm;