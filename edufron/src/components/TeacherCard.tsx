import React from 'react';
import { motion } from 'framer-motion';
import { Star, BookOpen, Award } from 'lucide-react';

// Define Teacher type
interface Teacher {
  image: string;
  name: string;
  subject: string;
  description: string;
  experience: number;
  qualifications: string;
  rating: number | string;
}

// Props for TeacherCard
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
          src={teacher.image}
          alt={teacher.name}
          className="w-full h-64 object-cover"
          loading="lazy"
        />
        <div className="absolute top-4 right-4">
          <div className="bg-white rounded-full px-3 py-1 flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-medium">{teacher.rating}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{teacher.name}</h3>
        <p className="text-emerald-600 font-medium mb-3">{teacher.subject}</p>
        <p className="text-slate-600 mb-4">{teacher.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-slate-500">
            <Award className="w-4 h-4 mr-2" />
            <span>{teacher.experience} years experience</span>
          </div>
          <div className="flex items-center text-sm text-slate-500">
            <BookOpen className="w-4 h-4 mr-2" />
            <span>{teacher.qualifications}</span>
          </div>
        </div>
        
        <button className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors">
          View Profile
        </button>
      </div>
    </motion.div>
  );
};

export default TeacherCard;
