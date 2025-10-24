import React from "react";
import PropTypes from "prop-types";

/**
 * ClassTable
 * - Expects classes to include:
 *   - id, name
 *   - teacherName (string) or teacherId
 *   - subjectNames (array) or subjectIds
 *
 * This version prefers the teacherName/subjectNames returned by the backend DTO.
 */
const ClassTable = ({ classes = [], teachers = [], subjects = [], onDelete, onEdit }) => {
  const lookupTeacherName = (cls) => {
    if (cls.teacherName) return cls.teacherName;
    if (cls.raw && (cls.raw.teacher_name || cls.raw.teacherName)) return cls.raw.teacher_name ?? cls.raw.teacherName;
    const id = cls.teacherId ?? (cls.raw && (cls.raw.teacher_id ?? (cls.raw.teacher && cls.raw.teacher.id)));
    if (id == null) return "";
    const t = teachers.find((x) => String(x.id) === String(id));
    return t ? `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() : String(id);
  };

  const lookupSubjectName = (cls) => {
    // backend DTO may include subjectNames array
    if (Array.isArray(cls.subjectNames) && cls.subjectNames.length > 0) return cls.subjectNames.join(", ");
    if (cls.raw && Array.isArray(cls.raw.subjectNames) && cls.raw.subjectNames.length > 0) return cls.raw.subjectNames.join(", ");
    // fallback: try subjectIds and lookup in subjects list
    const ids = cls.subjectIds ?? (cls.raw && (cls.raw.subjectIds ?? cls.raw.subjectIds)) ?? (cls.raw && cls.raw.subjects ? cls.raw.subjects.map((s) => s.id) : []);
    if (!ids || ids.length === 0) return "";
    const names = ids.map((id) => {
      const s = subjects.find((x) => String(x.id) === String(id));
      return s ? s.name : String(id);
    });
    return names.join(", ");
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2 border">ID</th>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Teacher</th>
            <th className="px-4 py-2 border">Subject(s)</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((cls) => (
            <tr key={cls.id ?? `${cls.name}-${Math.random()}`}>
              <td className="px-4 py-2 border">{cls.id ?? ""}</td>
              <td className="px-4 py-2 border">{cls.name ?? ""}</td>
              <td className="px-4 py-2 border">{lookupTeacherName(cls)}</td>
              <td className="px-4 py-2 border">{lookupSubjectName(cls)}</td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => onEdit && onEdit(cls)}
                  className="mr-2 px-2 py-1 bg-blue-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete && onDelete(Number(cls.id))}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {classes.length === 0 && (
            <tr>
              <td colSpan="5" className="px-4 py-2 border text-center text-gray-500">
                No classes found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

ClassTable.propTypes = {
  classes: PropTypes.array,
  teachers: PropTypes.array,
  subjects: PropTypes.array,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
};

export default ClassTable;