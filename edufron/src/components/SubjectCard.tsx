import React from "react";

interface SubjectCardProps {
  name: string;
  image: string;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ name, image }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="h-32 w-full overflow-hidden">
        <img
         src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>
      <div className="p-4 text-center">
        <h3 className="text-lg font-bold text-slate-900">{name}</h3>
      </div>
    </div>
  );
};

export default SubjectCard;
