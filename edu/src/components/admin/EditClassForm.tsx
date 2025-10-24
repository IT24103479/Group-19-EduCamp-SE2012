import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

/**
 * EditClassForm
 * - Initializes select values from the DTO/raw entity the backend returns.
 * - Sends payload shaped for the current backend: teacher: { id }, subjects: [{ id }, ...]
 * - After success calls onClassUpdated() and parent will refresh list from backend.
 */
const EditClassForm = ({ classData = {}, teachers = [], subjects = [], onClassUpdated, onCancel }) => {
  // classData may be DTO (with teacherId/teacherName, subjectIds/subjectNames) or raw ClassEntity
  const getInitialTeacherId = (cls) => {
    if (!cls) return "";
    return String(cls.teacherId ?? cls.teacher_id ?? (cls.teacher && cls.teacher.id) ?? "");
  };

  const getInitialSubjectId = (cls) => {
    if (!cls) return "";
    // if DTO has subjectIds array, take first
    if (Array.isArray(cls.subjectIds) && cls.subjectIds.length > 0) return String(cls.subjectIds[0]);
    if (Array.isArray(cls.subjectIds) && cls.subjectIds.length > 0) return String(cls.subjectIds[0]);
    // raw subjects array
    if (Array.isArray(cls.raw && cls.raw.subjects) && cls.raw.subjects.length > 0) return String(cls.raw.subjects[0].id);
    // raw direct subjects
    if (Array.isArray(cls.subjects) && cls.subjects.length > 0) return String(cls.subjects[0].id);
    return "";
  };

  const [name, setName] = useState(classData?.name ?? classData?.raw?.name ?? "");
  const [teacherId, setTeacherId] = useState(getInitialTeacherId(classData));
  const [subjectId, setSubjectId] = useState(getInitialSubjectId(classData));

  useEffect(() => {
    setName(classData?.name ?? classData?.raw?.name ?? "");
    setTeacherId(getInitialTeacherId(classData));
    setSubjectId(getInitialSubjectId(classData));
  }, [classData, teachers, subjects]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!classData || (classData.id == null && !(classData.raw && classData.raw.class_id))) {
      toast.error("No class selected to edit");
      return;
    }

    // Determine id for endpoint
    const id = classData.id ?? (classData.raw && classData.raw.class_id) ?? classData.class_id;

    const payload: any = {
      name: name?.trim(),
      grade: null,
      fee: null,
      timetable: null,
      teacher: teacherId ? { id: Number(teacherId) } : null,
      subjects: subjectId ? [{ id: Number(subjectId) }] : [],
    };

    try {
      const res = await fetch(`http://localhost:8081/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to update class");
      }

      await res.json().catch(() => null);

      onClassUpdated && onClassUpdated();
      toast.success("Class updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update class");
    }
  };

  return (
    <form onSubmit={handleSave} className="mb-4 p-4 border rounded bg-white">
      <h2 className="text-lg font-semibold mb-2">Edit class</h2>

      <div className="mb-2">
        <label className="block text-sm font-medium">Class name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border px-2 py-1"
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium">Teacher</label>
        <select
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          className="mt-1 block w-full border px-2 py-1"
        >
          <option value="">-- select teacher --</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {`${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() || t.email || t.id}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium">Subject</label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="mt-1 block w-full border px-2 py-1"
        >
          <option value="">-- select subject --</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex space-x-2">
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">
          Save
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-1 bg-gray-400 text-white rounded">
          Cancel
        </button>
      </div>
    </form>
  );
};

EditClassForm.propTypes = {
  classData: PropTypes.any,
  teachers: PropTypes.array,
  subjects: PropTypes.array,
  onClassUpdated: PropTypes.func,
  onCancel: PropTypes.func,
};

export default EditClassForm;