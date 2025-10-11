package com.example.Edu_Camp.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admins")
@PrimaryKeyJoinColumn(name = "user_id")
public class Admin extends User {

    private String adminLevel;
    private String phoneNumber;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Admin() {
        super();
        this.updatedAt = LocalDateTime.now();
    }

    public Admin(String firstName, String lastName, String email, String password, String adminLevel) {
        super(firstName, lastName, email, password, "ADMIN");
        this.adminLevel = adminLevel;
        this.updatedAt = LocalDateTime.now();
    }

    // getters & setters...
    public String getAdminLevel() { return adminLevel; }
    public void setAdminLevel(String adminLevel) { this.adminLevel = adminLevel; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        super.preUpdate();
    }
}
