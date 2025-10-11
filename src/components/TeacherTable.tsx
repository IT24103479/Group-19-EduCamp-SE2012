import React from 'react';

interface Teacher {
  id: number;
  name: string;
  subject: string;
  email: string;
  phone: string;
  address: string;
  qualification: string;
  b_day: string;
  j_date: string;
}

interface TeacherTableProps {
  teachers: Teacher[];
  onDelete: (id: number) => void;
  onEdit: (teacher: Teacher) => void;
}

const TeacherTable: React.FC<TeacherTableProps> = ({ teachers, onDelete, onEdit }) => {
  return (
    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
      <thead className="bg-emerald-500 text-white">
        <tr>
          <th className="py-2 px-4">Name</th>
          <th className="py-2 px-4">Subject</th>
          <th className="py-2 px-4">Email</th>
          <th className="py-2 px-4">Phone</th>
          <th className="py-2 px-4">Qualification</th>
          <th className="py-2 px-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {teachers.map((teacher) => (
          <tr key={teacher.id} className="border-b hover:bg-gray-50">
            <td className="py-2 px-4">{teacher.name}</td>
            <td className="py-2 px-4">{teacher.subject}</td>
            <td className="py-2 px-4">{teacher.email}</td>
            <td className="py-2 px-4">{teacher.phone}</td>
            <td className="py-2 px-4">{teacher.qualification}</td>
            <td className="py-2 px-4 space-x-2">
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => onEdit(teacher)}
              >
                Edit
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => onDelete(teacher.id)}
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

export default TeacherTable;
