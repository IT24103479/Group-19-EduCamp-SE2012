package com.example.Edu_Camp.dto;



import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

/**
 * Response DTO returned to frontend so we can control field names (including enrolled_at)
 * and include student_number from the joined student entity.
 */
public class EnrollmentResponseDTO {
    private Long id;

    @JsonProperty("student_id")
    private Long studentId;

    @JsonProperty("student_number")
    private String studentNumber;

    @JsonProperty("class_id")
    private Long classId;

    @JsonProperty("payment_id")
    private Long paymentId;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("status")
    private boolean status;

    @JsonProperty("enrolled_at")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime enrolledAt;

    @JsonProperty("expires_at")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime expiresAt;

    public EnrollmentResponseDTO() {}

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }

    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public boolean isStatus() { return status; }
    public void setStatus(boolean status) { this.status = status; }

    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}