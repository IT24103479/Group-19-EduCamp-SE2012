import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE } from "../lib/api";

const AddTeacherForm: React.FC = () => {
  const [teacher, setTeacher] = useState({
    name: "",
    email: "",
    phone: "",
    qualification: "",
    b_day: "",
    image: "",
    subjectId: "", // subject ID from dropdown
  });

  const [message, setMessage] = useState("");

  // ✅ Handle all input changes (text + select)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTeacher((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare the payload matching backend structure
    const payload = {
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      qualification: teacher.qualification,
      b_day: teacher.b_day,
      image: teacher.image,
      subject: {
        id: Number(teacher.subjectId), // convert to number
      },
    };

    try {
      const response = await fetch(`${API_BASE}/api/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to register teacher");
      }

      setMessage("✅ Teacher registered successfully!");
      setTeacher({
        name: "",
        email: "",
        phone: "",
        qualification: "",
        b_day: "",
        image: "",
        subjectId: "",
      });
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to register teacher. Please check your input data.");
    }
  };

  return (
    <>
      <Header />

      <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto my-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Register Teacher</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name */}
          <label className="block font-semibold">Name:</label>
          <input
            type="text"
            name="name"
            value={teacher.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="w-full border p-2 rounded"
            style={{
              backgroundColor: 'white',
              backgroundImage: 'none',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '0 0',
              backgroundSize: 'auto',
              backgroundAttachment: 'scroll'
            }}
          />

          {/* Email */}
          <label className="block font-semibold mt-2">Email:</label>
          <input
            type="email"
            name="email"
            value={teacher.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full border p-2 rounded"
            style={{
              backgroundColor: 'white',
              backgroundImage: 'none',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '0 0',
              backgroundSize: 'auto',
              backgroundAttachment: 'scroll'
            }}
          />

          {/* Phone */}
          <label className="block font-semibold mt-2">Phone Number:</label>
          <input
            type="tel"
            name="phone"
            value={teacher.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            required
            className="w-full border p-2 rounded"
            style={{
              backgroundColor: 'white',
              backgroundImage: 'none',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '0 0',
              backgroundSize: 'auto',
              backgroundAttachment: 'scroll'
            }}
          />

          {/* Qualification */}
          <label className="block font-semibold mt-2">Qualification:</label>
          <input
            type="text"
            name="qualification"
            value={teacher.qualification}
            onChange={handleChange}
            placeholder="Qualification"
            required
            className="w-full border p-2 rounded"
            style={{
              backgroundColor: 'white',
              backgroundImage: 'none',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '0 0',
              backgroundSize: 'auto',
              backgroundAttachment: 'scroll'
            }}
          />

          {/* Birthday */}
          <label className="block font-semibold mt-2">Birthday:</label>
          <input
            type="date"
            name="b_day"
            value={teacher.b_day}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
            style={{
              backgroundColor: 'white',
              backgroundImage: 'none',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '0 0',
              backgroundSize: 'auto',
              backgroundAttachment: 'scroll'
            }}
          />

          {/* Image */}
          <label className="block font-semibold mt-2">Image URL:</label>
          <input
            type="text"
            name="image"
            value={teacher.image}
            onChange={handleChange}
            placeholder="Image URL or file name"
            required
            className="w-full border p-2 rounded"
            style={{
              backgroundColor: 'white',
              backgroundImage: 'none',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '0 0',
              backgroundSize: 'auto',
              backgroundAttachment: 'scroll'
            }}
          />

          {/* Subject dropdown */}
          <label className="block font-semibold mt-2">Subject:</label>
          <select
            name="subjectId"
            value={teacher.subjectId}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
            style={{
              backgroundColor: 'white',
              backgroundImage: 'none',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '0 0',
              backgroundSize: 'auto',
              backgroundAttachment: 'scroll'
            }}
          >
            <option value="">-- Choose Subject --</option>
            <option value="1">Mathematics</option>
            <option value="2">Science</option>
            <option value="3">English</option>
            <option value="4">ICT</option>
          </select>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-emerald-500 text-white p-2 rounded hover:bg-emerald-600"
          >
            Register
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center ${
              message.startsWith("✅")
                ? "text-emerald-600"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      <Footer />
    </>
  );
};

export default AddTeacherForm;