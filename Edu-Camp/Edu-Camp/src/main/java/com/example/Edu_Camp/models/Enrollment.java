package com.example.Edu_Camp.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="enrollments")
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name="class_id", nullable = false)
    private ClassEntity classEntity;

    @ManyToOne
    @JoinColumn(name="payment_id")
    private Payment payment;

    private boolean paymentCompleted;
    private LocalDateTime enrollmentDate;
    private String paypalTransactionId;

    public Enrollment() {}

    // Proper constructor
    public Enrollment(User user, ClassEntity classEntity, Payment payment) {
        this.user = user;
        this.classEntity = classEntity;
        this.payment = payment;
        this.paymentCompleted = payment != null;
        this.enrollmentDate = LocalDateTime.now();
    }

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public ClassEntity getClassEntity() { return classEntity; }
    public void setClassEntity(ClassEntity classEntity) { this.classEntity = classEntity; }

    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }

    public boolean isPaymentCompleted() { return paymentCompleted; }
    public void setPaymentCompleted(boolean paymentCompleted) { this.paymentCompleted = paymentCompleted; }

    public LocalDateTime getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDateTime enrollmentDate) { this.enrollmentDate = enrollmentDate; }

    public String getPaypalTransactionId() { return paypalTransactionId; }
    public void setPaypalTransactionId(String paypalTransactionId) { this.paypalTransactionId = paypalTransactionId; }

    // Convenience getters for IDs
    public Long getUserId() { return user != null ? user.getId() : null; }
    public Long getClassId() { return classEntity != null ? classEntity.getClass_id() : null; }
    public Long getPaymentId() { return payment != null ? payment.getId() : null; }
}
