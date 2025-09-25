import React from "react";

function ClassCard({ cls, onClick }) {
  return (
    <div
      className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl transition"
      onClick={onClick}
    >
      <h2 className="text-xl font-bold">{cls.grade}</h2>
      <p className="text-gray-700">
        Teacher: {cls.teacher?.name || "N/A"}
      </p>
      <p className="text-gray-700">
        Subjects: {cls.subjects.map((s) => s.name).join(", ")}
      </p>
    </div>
  );
}

export default ClassCard;
