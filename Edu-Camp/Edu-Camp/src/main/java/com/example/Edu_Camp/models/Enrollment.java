package com.example.Edu_Camp.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
public class Enrollment {

    @ManyToOne(fetch = FetchType.EAGER)
    @JsonBackReference
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JsonBackReference
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity classEntity;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @Column(name = "enrolled_at", nullable = false)
    private LocalDateTime enrolledAt = LocalDateTime.now();

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt = LocalDateTime.now().plusMonths(1);

    @Column(name = "status", nullable = false)
    private boolean status = true;

    public Enrollment() {}

    // Preferred constructor using entities
    public Enrollment(Student student, ClassEntity classEntity, Payment payment,User user) {
        this.user=user;
        this.student = student;
        this.classEntity = classEntity;
        this.payment = payment;
        this.enrolledAt = LocalDateTime.now();
        this.expiresAt = this.enrolledAt.plusMonths(1);
    }

    // Constructor that accepts IDs and creates placeholder associated entities with only ids set
    public Enrollment(Long studentId, Long classId, Long paymentId) {
        if (studentId != null) {
            Student s = new Student();
            s.setId(studentId);
            this.student = s;
        }
        if (classId != null) {
            ClassEntity c = new ClassEntity();
            // ClassEntity uses setClass_id in this project
            c.setClass_id(classId);
            this.classEntity = c;
        }
        if (paymentId != null) {
            Payment p = new Payment();
            p.setId(paymentId);
            this.payment = p;
        }
        this.enrolledAt = LocalDateTime.now();
        this.expiresAt = this.enrolledAt.plusMonths(1);
    }

    @PrePersist
    public void prePersist() {
        if (enrolledAt == null) {
            enrolledAt = LocalDateTime.now();
        }
        if (expiresAt == null) {
            expiresAt = enrolledAt.plusMonths(1);
        }
    }

    public boolean isActive() {
        return LocalDateTime.now().isBefore(expiresAt);
    }

    // ID
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    // Entity accessors
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public ClassEntity getClassEntity() { return classEntity; }
    public void setClassEntity(ClassEntity classEntity) { this.classEntity = classEntity; }

    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }

    // Convenience ID getters (null-safe)
    public Long getStudentId() { return student != null ? student.getId() : null; }
    public Long getClassId() { return classEntity != null ? classEntity.getClass_id() : null; }
    public Long getPaymentId() { return payment != null ? payment.getId() : null; }

    // Dates and status
    public LocalDateTime getEnrolledDate() { return enrolledAt; }
    public void setEnrolledDate(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public boolean getStatus() { return status; }
    public void setStatus(boolean status) { this.status = status; }
}
