import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Teacher {
  id: number;
  name: string;
  subject: { id: number; name: string };
  email: string;
  phone: string;
  address: string;
  qualification: string;
  b_day: string;
  j_date: string;
  image?: string;
}

interface TeacherCardProps {
  teacher: Teacher;
  index: number;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
    >
      <div className="relative">
        <img
          src={teacher.image || 'https://via.placeholder.com/400x300?text=Teacher+Photo'}
          alt={teacher.name}
          className="w-full h-64 object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{teacher.name}</h3>
        <p className="text-emerald-600 font-medium mb-3">{teacher.subject?.name}</p>
        <p className="text-slate-600 mb-4">{teacher.qualification}</p>

        <Link to={`/teachers/${teacher.id}`}>
          <button className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors">
            View Profile
          </button>
        </Link>
      </div>
    </motion.div>
  );
};

export default TeacherCard;