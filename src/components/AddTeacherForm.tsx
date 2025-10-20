import React, { useState } from "react";

const AddTeacherForm: React.FC = () => {
  const [teacher, setTeacher] = useState({
    name: "",
    email: "",
    phone: "",
    qualification: "",
    b_day: "",
    image: "",
    subjectId: "" // separate field for subject ID (e.g., select from dropdown)
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTeacher({ ...teacher, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Prepare the payload in the format backend expects
    const payload = {
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      qualification: teacher.qualification,
      b_day: teacher.b_day,
      image: teacher.image,
        subject: {
      id: Number(teacher.subjectId) // ✅ Convert string to number and wrap
    } 
    };

    try {
      const response = await fetch("http://localhost:8080/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to register teacher");

      setMessage("✅ Teacher registered successfully!");
      setTeacher({
        name: "",
        email: "",
        phone: "",
        qualification: "",
        b_day: "",
        image: "",
        subjectId: ""
      });
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to register teacher. Check input data.");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Register Teacher</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block font-semibold mt-2"> Name:</label>
        <input name="name" value={teacher.name} onChange={handleChange} placeholder="Name" className="w-full border p-2 rounded" />
        <label className="block font-semibold mt-2"> Email:</label>
        <input name="email" value={teacher.email} onChange={handleChange} placeholder="Email" className="w-full border p-2 rounded" />
        <label className="block font-semibold mt-2"> Phone Number:</label>
        <input name="phone" value={teacher.phone} onChange={handleChange} placeholder="Phone" className="w-full border p-2 rounded" />
        <label className="block font-semibold mt-2"> Qualification:</label>
        <input name="qualification" value={teacher.qualification} onChange={handleChange} placeholder="Qualification" className="w-full border p-2 rounded" />
        <label className="block font-semibold mt-2"> Birthday:</label>
        
          <input
                type="date"
                name="b_day"
                value={teacher.b_day}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-emerald-400"
              />
           
        <label className="block font-semibold mt-2"> Image:</label>
        <input name="image" value={teacher.image} onChange={handleChange} placeholder="Image URL or file name" className="w-full border p-2 rounded" />
        
        {/* ✅ Subject ID input (or replace with dropdown later) */}
  <label className="block font-semibold mt-2"> Subject</label>
  <select
    name="subjectId"
    value={teacher.subjectId}
    onChange={handleChange}
    required
    className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-400"
  >
    <option value="">-- Choose Subject --</option>
    <option value="1">Mathematics</option>
    <option value="2">Science</option>
    <option value="3">English</option>
    <option value="4">ICT</option>
  </select>

        <button type="submit" className="w-full bg-emerald-500 text-white p-2 rounded hover:bg-emerald-600">
          Register
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default AddTeacherForm;

