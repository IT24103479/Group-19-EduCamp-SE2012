package com.example.Edu_Camp.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "admins")
@PrimaryKeyJoinColumn(name = "user_id")
public class Admin extends User {

    // If JPA needs a no-arg constructor:
    public Admin() {
        super();
    }

    // --- Additional Admin Fields ---

    // Map the 'name' column that exists in the admins table.
    // Mark it nullable to avoid NOT NULL constraint problems if it's optional.
    @Column(name = "name", length = 150, nullable = true)
    private String name;

    @Column(length = 100)
    private String qualification;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String address;

    @Column(name = "b_day")
    private LocalDate birthday;

    @Column(name = "j_date")
    private LocalDate joiningDate;

    @Column(name = "admin_level")
    private String adminLevel;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;

    public Admin(String firstName, String lastName, String email, String password, String adminLevel) {
        super(firstName, lastName, email, password, "ADMIN");
        this.adminLevel = adminLevel;
        this.updatedAt = LocalDateTime.now();
    }

    // --- Getters & Setters ---

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getqualification() { return qualification; }
    public void setqualification(String position) { this.qualification = position; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public LocalDate getBirthday() { return birthday; }
    public void setBirthday(LocalDate birthday) { this.birthday = birthday; }

    public LocalDate getJoiningDate() { return joiningDate; }
    public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }

    public String getAdminLevel() { return adminLevel; }
    public void setAdminLevel(String adminLevel) { this.adminLevel = adminLevel; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
        // If User has a prePersist/preUpdate in base class, call here if needed:
        // super.prePersist(); // uncomment if User defines it
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        // If User has a preUpdate in base class, call it:
        // super.preUpdate(); // uncomment if User defines it
    }
}