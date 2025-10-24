package com.example.Edu_Camp.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean paymentCompleted;
    private String paypalTransactionId;
    private String paypalOrderId;
    private LocalDateTime enrollmentDate;
    private String enrollmentId;

    private Long classId;
    private Long userId;

    private Double amount;
    private String currency;

    @Transient
    private String approvalUrl;

    @PrePersist
    public void prePersist() {
        if (enrollmentId == null) enrollmentId = UUID.randomUUID().toString();
        if (enrollmentDate == null) enrollmentDate = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public boolean isPaymentCompleted() { return paymentCompleted; }
    public void setPaymentCompleted(boolean paymentCompleted) { this.paymentCompleted = paymentCompleted; }

    public String getPaypalTransactionId() { return paypalTransactionId; }
    public void setPaypalTransactionId(String paypalTransactionId) { this.paypalTransactionId = paypalTransactionId; }

    public String getPaypalOrderId() { return paypalOrderId; }
    public void setPaypalOrderId(String paypalOrderId) { this.paypalOrderId = paypalOrderId; }

    public LocalDateTime getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDateTime enrollmentDate) { this.enrollmentDate = enrollmentDate; }

    public String getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(String enrollmentId) { this.enrollmentId = enrollmentId; }

    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getApprovalUrl() { return approvalUrl; }
    public void setApprovalUrl(String approvalUrl) { this.approvalUrl = approvalUrl; }
}