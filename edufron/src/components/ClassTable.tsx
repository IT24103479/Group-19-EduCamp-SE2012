import React from "react";
import type { ClassItem } from "../pages/Classes";

interface ClassTableProps {
  classes: ClassItem[];
  onEdit: (cls: ClassItem) => void;
  onDelete: (id: number) => void;
}

const ClassTable: React.FC<ClassTableProps> = ({ classes, onEdit, onDelete }) => {
  if (!Array.isArray(classes) || classes.length === 0) {
    return <p>No classes found.</p>;
  }

  return (
    <table className="min-w-full bg-white border rounded overflow-hidden">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2 text-left">Grade</th>
          <th className="px-4 py-2 text-left">Fee</th>
          <th className="px-4 py-2 text-left">Teacher</th>
          <th className="px-4 py-2 text-left">Subjects</th>
          <th className="px-4 py-2 text-left">Timetable</th>
          <th className="px-4 py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {classes.map((cls) => (
          <tr key={cls.id} className="border-t">
            <td className="px-4 py-2">{cls.grade}</td>
            <td className="px-4 py-2">{cls.fee}</td>
            <td className="px-4 py-2">{cls.teacher?.name || "No teacher"}</td>
            <td className="px-4 py-2">
              {cls.subjects?.map((s) => s.name).join(", ") || "No subjects"}
            </td>
            <td className="px-4 py-2">{cls.timetable}</td>
            <td className="px-4 py-2 flex gap-2">
              <button
                className="bg-yellow-500 text-white px-2 py-1 rounded"
                onClick={() => onEdit(cls)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => onDelete(cls.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ClassTable;
