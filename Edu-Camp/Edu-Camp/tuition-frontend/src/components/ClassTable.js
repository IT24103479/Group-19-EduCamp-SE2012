// src/components/ClassTable.js
import React from "react";

function ClassTable({ classes, onEdit, onDelete }) {
  if (!Array.isArray(classes) || classes.length === 0) {
    return <p>No classes found.</p>;
  }

  return (
    <table className="min-w-full bg-white border">
      <thead>
        <tr>
          <th>Grade</th>
          <th>Fee</th>
          <th>Teacher</th>
          <th>Subjects</th>
          <th>Timetable</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {classes.map(cls => (
          <tr key={cls.class_id}>
            <td>{cls.grade}</td>
            <td>{cls.fee}</td>
            <td>{cls.teacher?.name || "No teacher"}</td>
            <td>{cls.subjects?.map(s => s.name).join(", ") || "No subjects"}</td>
            <td>{cls.timetable}</td>
            <td>
              <button
                onClick={() => onEdit(cls)}
                className="bg-yellow-500 text-white px-2 py-1 mr-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(cls.class_id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ClassTable;
