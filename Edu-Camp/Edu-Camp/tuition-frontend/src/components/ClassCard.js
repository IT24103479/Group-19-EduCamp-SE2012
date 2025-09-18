import React from "react";

const ClassCard = ({ classData, onClick }) => {
  return (
    <div className="class-card" onClick={onClick}>
      <h3>{classData.subject}</h3>
      <p>Grade: {classData.grade}</p>
      <p>Teacher: {classData.teacher}</p>
      <p>Fee: ${classData.fee}</p>
    </div>
  );
};

export default ClassCard;
