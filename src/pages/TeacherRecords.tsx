import React, { useState, useEffect } from 'react';
import TeacherTable from '../components/TeacherTable';
import AddTeacher from '../components/AddTeacher';

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

const TeacherRecords: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchTeachers = () => {
    fetch('http://localhost:8080/teachers')
      .then(res => res.json())
      .then(data => setTeachers(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = (teacher: Omit<Teacher, 'id'>) => {
    fetch('http://localhost:8080/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacher),
    })
      .then(res => res.json())
      .then(() => {
        fetchTeachers();
        setShowAddForm(false);
      });
  };

  const handleDeleteTeacher = (id: number) => {
    fetch(`http://localhost:8080/teachers/${id}`, { method: 'DELETE' })
      .then(() => fetchTeachers());
  };

  const handleEditTeacher = (teacher: Teacher) => {
    const updatedName = prompt('Edit name', teacher.name);
    if (!updatedName) return;

    fetch(`http://localhost:8080/teachers/${teacher.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...teacher, name: updatedName }),
    })
      .then(() => fetchTeachers());
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Teacher Records</h1>
      <button
        onClick={() => setShowAddForm(true)}
        className="mb-4 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
      >
        Add Teacher
      </button>

      {showAddForm && (
        <AddTeacher
          onAdd={handleAddTeacher}
          onClose={() => setShowAddForm(false)}
        />
      )}

      <TeacherTable
        teachers={teachers}
        onDelete={handleDeleteTeacher}
        onEdit={handleEditTeacher}
      />
    </div>
  );
};

export default TeacherRecords;
