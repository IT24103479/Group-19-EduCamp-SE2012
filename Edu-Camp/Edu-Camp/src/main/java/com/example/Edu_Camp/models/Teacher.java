package com.example.Edu_Camp.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "teachers")
@PrimaryKeyJoinColumn(name = "user_id")
public class Teacher extends User {

    @Column(unique = true, nullable = false)
    private String teacherNumber;

    @Column(nullable = false)
    private String phoneNumber;

    private String qualification;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String image;

    @Column(name = "subject_name")
    private String subjectName;

    @Column(name = "join_date")
    private LocalDate joinDate;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Teacher() {
        super();
        this.joinDate = LocalDate.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Teacher(String firstName, String lastName, String email, String password,
                   String teacherNumber, String phoneNumber, String qualification,
                   LocalDate dateOfBirth, String image, String subjectName) {
        super(firstName, lastName, email, password, "TEACHER");
        this.teacherNumber = teacherNumber;
        this.phoneNumber = phoneNumber;
        this.qualification = qualification;
        this.dateOfBirth = dateOfBirth;
        this.image = image;
        this.subjectName = subjectName;
        this.joinDate = LocalDate.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getTeacherNumber() { return teacherNumber; }
    public void setTeacherNumber(String teacherNumber) { this.teacherNumber = teacherNumber; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public LocalDate getJoinDate() { return joinDate; }
    public void setJoinDate(LocalDate joinDate) { this.joinDate = joinDate; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        super.preUpdate();
    }
}