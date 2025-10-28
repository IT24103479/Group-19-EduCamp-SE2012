# EduCamp

## Authors / Group

**Group ID:** 19

**Members:**
- IT24103479 – Withanage M.P.A
- IT24103502 – Jayawickrama S.Y
- IT24101346 – Gunasekara K.T.W
- IT24103581 – Lalanga J.A.L

## Project Overview
EduCamp is a web-based system designed to manage classes, teachers, subjects, and students efficiently. The platform allows:

- Visitors to browse and search available classes.
- Students to enroll in classes and view schedules.
- Admins to monitor and manage class records, teacher records, and payment records.
- Teachers to upload learning materials and manage assignments (LMS integration).

This project is developed as part of the Database Management and Software Engineering coursework.

---

## Features

### Admin
- Add, edit, delete, and view classes.
- Assign teachers and subjects to classes.
- Manage class schedules and fees.

### Student
- Browse and search classes by grade, subject, or teacher.
- Enroll in classes.

### Teacher
- Upload learning materials.
- Review and manage student assignments.

### System
- RESTful backend API.
- Frontend implemented with React and integrated with backend using Axios.
- Validations to prevent duplicate class entries.

---

## Technologies Used
- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Spring Boot (Java)
- **Database:** MySQL
- **HTTP Client:** Axios
- **Icons / UI:** Lucide React
- **Version Control:** Git & GitHub

---

## Setup Instructions

1. **Clone the Repository**
```bash
git clone https://github.com/IT24103479/Group-19-EduCamp-SE2012.git
cd EduCamp


## Backend Setup (Spring Boot)

```bash
cd Backend-EduCamp
```

Update `application.properties` with your MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name
spring.datasource.username=your_username
spring.datasource.password=your_password
```

Run the backend server:

```bash
./mvnw spring-boot:run
```

Backend will run on:

```text
http://localhost:8081/
```

---

## Frontend Setup (React)

```bash
cd Frontend-EduCamp
```

Install dependencies:

```bash
npm install
```

Start the frontend server:

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:5173/
```
