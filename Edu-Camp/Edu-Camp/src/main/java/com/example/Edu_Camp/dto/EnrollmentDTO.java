package com.example.Edu_Camp.dto;

/**
 * EnrollmentDTO: added studentNumber to allow creating/updating enrollments by student number
 * (server will resolve the Student using StudentRepository.findByStudentNumber).
 */
public class EnrollmentDTO {
    private Long studentId;
    private Long classId;
    private Long paymentId;
    private Long userId;
    private String status;
    private String enrolledAt; // optional: incoming string, parsed by service if you wish

    // New: accept studentNumber so callers can reference students by their student_number
    private String studentNumber;

    public EnrollmentDTO() {}

    public EnrollmentDTO(Long studentId, Long classId, Long paymentId) {
        this.studentId = studentId;
        this.classId = classId;
        this.paymentId = paymentId;
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(String enrolledAt) { this.enrolledAt = enrolledAt; }

    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }
}