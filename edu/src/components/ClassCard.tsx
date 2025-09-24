import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, MapPin } from "lucide-react";

interface ClassItem {
  name: string;
  description: string;
  type: string;
  schedule: string;
  duration: string;
  capacity: number;
  location: string;
  price: number;
  image: string;
}

interface ClassCardProps {
  classItem: ClassItem;
  index: number;
}

const ClassCard: React.FC<ClassCardProps> = ({ classItem, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
    >
      {/* Image / Header */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={classItem.image}
          alt={classItem.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-sky-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {classItem.type}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{classItem.name}</h3>
        <p className="text-slate-600 mb-4">{classItem.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-slate-500">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{classItem.schedule}</span>
          </div>
          <div className="flex items-center text-sm text-slate-500">
            <Clock className="w-4 h-4 mr-2" />
            <span>{classItem.duration}</span>
          </div>
          <div className="flex items-center text-sm text-slate-500">
            <Users className="w-4 h-4 mr-2" />
            <span>{classItem.capacity} students max</span>
          </div>
          <div className="flex items-center text-sm text-slate-500">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{classItem.location}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-emerald-600">Rs. {classItem.price}</span>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
            Join Class
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ClassCard;
