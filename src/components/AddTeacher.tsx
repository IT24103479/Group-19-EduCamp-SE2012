import React, { useState } from 'react';

interface Teacher {
  name: string;
  subject: string;
  email: string;
  phone: string;
  address: string;
  qualification: string;
  b_day: string;
  j_date: string;
}

interface AddTeacherProps {
  onAdd: (teacher: Teacher) => void;
  onClose: () => void;
}

const AddTeacher: React.FC<AddTeacherProps> = ({ onAdd, onClose }) => {
  const [teacher, setTeacher] = useState<Teacher>({
    name: '',
    subject: '',
    email: '',
    phone: '',
    address: '',
    qualification: '',
    b_day: '',
    j_date: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(teacher);
    setTeacher({
      name: '',
      subject: '',
      email: '',
      phone: '',
      address: '',
      qualification: '',
      b_day: '',
      j_date: '',
    });
  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto my-4">
      <h2 className="text-2xl font-bold mb-4">Add Teacher</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {Object.keys(teacher).map((key) => (
          <input
            key={key}
            name={key}
            value={(teacher as any)[key]}
            onChange={handleChange}
            placeholder={key.replace('_', ' ')}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        ))}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600">
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTeacher;
