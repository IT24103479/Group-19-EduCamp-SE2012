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

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Teacher() {
        super();
        this.updatedAt = LocalDateTime.now();
    }

    public Teacher(String firstName, String lastName, String email, String password,
                   String department, String employeeId) {
        super(firstName, lastName, email, password, "TEACHER");
        this.department = department;
        this.employeeId = employeeId;
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

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        super.preUpdate();
    }
}
