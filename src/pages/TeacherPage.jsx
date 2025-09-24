import React from "react";

function TeacherPage() {
  // Sample data for teachers
  const teachers = [
    { id: 1, name: "Anuradha Lakmal", subject: " Maths" },
    { id: 2, name: "Disna Chandrasena", subject: "Maths" },
    { id: 3, name: "Janaka Nayanapriya", subject: "Science" },
    { id: 4, name: "Chandana Disanayaka", subject: "Science" },
    { id: 5, name: "S. Dayalan", subject: "English" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Teachers</h1>
      <div style={{ display: "flex", gap: "30px", textAlign: "center" }}>
      {teachers.map((teacher) =>  (
        <div key={teacher.id}>
          <h2><strong style={{ color: "blue" }} >{teacher.name} </strong> </h2>
         <h3> <div style={{ color: "black" }} >{teacher.subject}</div> </h3>
        </div>
        ))}
       </div>
    </div>
  );
}

export default TeacherPage;
