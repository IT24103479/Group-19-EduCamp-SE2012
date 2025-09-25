package com.example.Edu_Camp.models;
import jakarta.persistence.*;

    @Entity
    @Table(name = "teacher_schedule")
    public class TeacherSchedule {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        @JoinColumn(name = "teacher_id", nullable = false)
        private Teacher teacher;

        private String day;
        private String startTime;
        private String endTime;
        private String className;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Teacher getTeacher() { return teacher; }
        public void setTeacher(Teacher teacher) { this.teacher = teacher; }

        public String getDay() { return day; }
        public void setDay(String day) { this.day = day; }

        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }

        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }

        public String getClassName() { return className; }
        public void setClassName(String className) { this.className = className; }
    }


