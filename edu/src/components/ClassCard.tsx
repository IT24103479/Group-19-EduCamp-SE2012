// src/components/ClassCard.tsx
import React from "react";

export interface ClassCardProps {
  classItem: {
    class_id: number;
    name: string;
    type: string;
    description: string;
    image: string;
    schedule: string;
    price: number;
  };
  onEnroll: (classId: number) => void;
  index?: number; // optional
}

const ClassCard: React.FC<ClassCardProps> = ({ classItem,onEnroll }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={classItem.image}
        alt={classItem.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{classItem.name}</h2>
       <p className="text-slate-600 whitespace-pre-line">{classItem.description}</p>
        <p className="mt-2 font-semibold">Fee: Rs. {classItem.price}</p>
        
        <button
          className="mt-3 w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          onClick={() => onEnroll(classItem.class_id)}
        >
          Enroll
        </button>
      </div>
    </div>
  );
};

export default ClassCard;