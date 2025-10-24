package com.example.Edu_Camp.models;

import jakarta.persistence.*; //map java objects to database tables
import java.util.List;
import com.example.Edu_Camp.models.Teacher;
import com.example.Edu_Camp.models.Subject;

@Entity
@Table(name = "classes")
public class ClassEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="class_id")
    private Long class_id;

    @Column(nullable=false)
    private String grade;

    @Column(nullable=false)
    private double fee;

    @Column(nullable = false)
    private String name;

    @Column(nullable=false, length=1000)
    private String timetable;

    // Many classes can have the same teacher
    @ManyToOne
    @JoinColumn(name="teacher_id", nullable=false)
    private Teacher teacher;

    // Many-to-many relationship with subjects
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name="class_subjects",
            joinColumns=@JoinColumn(name="class_id"),
            inverseJoinColumns=@JoinColumn(name="subject_id")
    )
    private List<Subject> subjects;

    public ClassEntity() {}

    // Getters and setters
    public Long getClass_id() { return class_id; }
    public void setClass_id(Long class_id) { this.class_id = class_id; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public double getFee() { return fee; }
    public void setFee(double fee) { this.fee = fee; }

    public String getTimetable() { return timetable; }
    public void setTimetable(String timetable) { this.timetable = timetable; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public List<Subject> getSubjects() { return subjects; }
    public void setSubjects(List<Subject> subjects) { this.subjects = subjects; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}