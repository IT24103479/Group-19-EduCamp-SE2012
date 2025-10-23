package com.example.Edu_Camp.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "teachers")
@PrimaryKeyJoinColumn(name = "user_id")
public class Teacher extends User {

    private String department;
    private String phoneNumber;
    private String employeeId;

    private String subject;
    private String phone;
    private String b_day;
    private String qualification;
    private String j_date;

    @Column(length = 1000) // optional: increase column size for longer URLs/base64
    private String image;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Teacher(String firstName, String lastName, String email, String password,
                   String department, String employeeId) {
        super(firstName, lastName, email, password, "TEACHER");
        this.department = department;
        this.employeeId = employeeId;
        this.updatedAt = LocalDateTime.now();
    }

    public Teacher(String firstName, String lastName, String email, String password,
                   String department, String employeeId, String phone, String address,
                   String qualification, String b_day, String j_date) {
        super(firstName, lastName, email, password, "TEACHER");
        this.subject = department;
        this.employeeId = employeeId;
        this.phone = phone;
        this.qualification = qualification;
        this.b_day = b_day;
        this.j_date = j_date;
    }
    public Teacher() {
        super();
        this.updatedAt = LocalDateTime.now();
    }
    // getters & setters...
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }



    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getB_day() { return b_day; }
    public void setB_day(String b_day) { this.b_day = b_day; }

    public String getJ_date() { return j_date; }
    public void setJ_date(String j_date) { this.j_date = j_date; }



    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        super.preUpdate();
    }
}