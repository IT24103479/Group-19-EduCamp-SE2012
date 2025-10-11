import React, { useState } from "react";
import { toast } from "react-toastify";

const TeacherMaterialForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !className || !file) {
      toast.error ("Please fill all required fields and select a file");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subject", subject);
    formData.append("className", className);
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/api/materials", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      toast.success("Material uploaded successfully!");
      setTitle(""); setDescription(""); setSubject(""); setClassName(""); setFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Upload Teacher Material</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input placeholder="Title*" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <input placeholder="Subject*" value={subject} onChange={e => setSubject(e.target.value)} />
        <input placeholder="Class*" value={className} onChange={e => setClassName(e.target.value)} />
        <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default TeacherMaterialForm;
