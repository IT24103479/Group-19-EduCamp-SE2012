import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users } from 'lucide-react';

// Define Subject type
interface Subject {
  image: string;
  name: string;
  grade: number | string;
  description: string;
  duration: string;
  students: number;
  price: string;
}

// Props for SubjectCard
interface SubjectCardProps {
  subject: Subject;
  index: number;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={subject.image}
          alt={subject.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Grade {subject.grade}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center mb-3">
          <BookOpen className="w-5 h-5 text-emerald-600 mr-2" />
          <h3 className="text-xl font-bold text-slate-900">{subject.name}</h3>
        </div>
        
        <p className="text-slate-600 mb-4 line-clamp-3">{subject.description}</p>
        
        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{subject.duration}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{subject.students} students</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-emerald-600">Rs. {subject.price}</span>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SubjectCard;
