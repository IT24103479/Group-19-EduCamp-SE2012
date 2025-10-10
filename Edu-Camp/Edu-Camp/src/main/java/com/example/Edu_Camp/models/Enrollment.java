package com.example.Edu_Camp.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity classEntity;

    @Column(name = "enroll_date", nullable = false)
    private LocalDateTime enrollDate = LocalDateTime.now();

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt = LocalDateTime.now().plusMonths(1);

    @Column(name = "status", nullable = false)
    private boolean status = true;

    @PrePersist
    public void prePersist() {
        if (enrollDate == null) {
            enrollDate = LocalDateTime.now();
        }
        if (expiresAt == null) {
            expiresAt = enrollDate.plusMonths(1);
        }
    }

    public boolean isActive() {
        return status && LocalDateTime.now().isBefore(expiresAt);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public ClassEntity getClassEntity() { return classEntity; }
    public void setClassEntity(ClassEntity classEntity) { this.classEntity = classEntity; }

    public LocalDateTime getEnrollDate() { return enrollDate; }
    public void setEnrollDate(LocalDateTime enrollDate) { this.enrollDate = enrollDate; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public boolean getStatus() { return status; }
    public void setStatus(boolean status) { this.status = status; }
}
