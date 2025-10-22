package com.example.Edu_Camp.dto;

public class EnrollmentDTO {
    private Long studentId;
    private Long classId;
    private Long paymentId;

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
}
