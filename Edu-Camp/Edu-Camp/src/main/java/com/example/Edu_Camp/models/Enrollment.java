package com.example.Edu_Camp.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
public class Enrollment {

    private static final Logger LOGGER = LoggerFactory.getLogger(Enrollment.class);

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

    /**
     * Denormalized student number stored on the enrollment to make lookups / responses
     * easier without always joining the students table. This must be kept in sync
     * with the associated Student entity.
     */
    @Column(name = "student_number")
    private String studentNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity classEntity;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    // Annotate fields so Jackson serializes them with the desired names and format.
    @Column(name = "enrolled_at", nullable = false)
    @JsonProperty("enrolled_at")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime enrolledAt = LocalDateTime.now();

    @Column(name = "expires_at", nullable = false)
    @JsonProperty("expires_at")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime expiresAt = LocalDateTime.now().plusMonths(1);

    @Column(name = "status", nullable = false)
    @JsonProperty("status")
    private boolean status = true;

    public Enrollment() {}

    // Preferred constructor using entities
    public Enrollment(Student student, ClassEntity classEntity, Payment payment, User user) {
        this.user = user;
        this.student = student;
        this.classEntity = classEntity;
        this.payment = payment;
        this.enrolledAt = LocalDateTime.now();
        this.expiresAt = this.enrolledAt.plusMonths(1);
        this.studentNumber = student != null ? student.getStudentNumber() : null;
        LOGGER.info("Created Enrollment(entity) - studentId={}, studentNumber={}", getStudentId(), this.studentNumber);
    }

    // Constructor that accepts IDs and creates placeholder associated entities with only ids set
    public Enrollment(Long studentId, Long classId, Long paymentId) {
        if (studentId != null) {
            Student s = new Student();
            s.setId(studentId);
            this.student = s;
            // note: with only an id we cannot populate studentNumber here
            LOGGER.info("Created Enrollment(IDs) placeholder studentId={} (studentNumber not available)", studentId);
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
        // ensure the denormalized studentNumber is consistent before persist
        if (this.student != null) {
            this.studentNumber = this.student.getStudentNumber();
        }
        LOGGER.info("PrePersist Enrollment - id={}, studentId={}, studentNumber={}, enrolledAt={}",
                id, getStudentId(), studentNumber, enrolledAt);
    }

    @PreUpdate
    public void preUpdate() {
        // keep studentNumber in sync if student changed
        if (this.student != null) {
            String prev = this.studentNumber;
            this.studentNumber = this.student.getStudentNumber();
            if ((prev == null && this.studentNumber != null) ||
                    (prev != null && !prev.equals(this.studentNumber))) {
                LOGGER.info("Enrollment studentNumber changed for enrollment id={} : {} -> {}",
                        id, prev, this.studentNumber);
            }
        }
        LOGGER.info("PreUpdate Enrollment - id={}, studentId={}, studentNumber={}, updatedAt={}",
                id, getStudentId(), studentNumber, LocalDateTime.now());
    }

    public boolean isActive() {
        return LocalDateTime.now().isBefore(expiresAt);
    }

    // ID
    public Long getId() { return id; }
    public void setId(Long id) {
        LOGGER.info("Setting Enrollment id: {}", id);
        this.id = id;
    }

    // Entity accessors

    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        LOGGER.info("Setting Enrollment.user userId={}", user != null ? user.getId() : null);
        this.user = user;
    }
    public Student getStudent() { return student; }
    public void setStudent(Student student) {
        Long prevId = getStudentId();
        String prevNumber = this.studentNumber;
        this.student = student;
        this.studentNumber = student != null ? student.getStudentNumber() : null;
        LOGGER.info("setStudent called on Enrollment id={} : studentId {} -> {}, studentNumber {} -> {}",
                id, prevId, getStudentId(), prevNumber, this.studentNumber);
    }

    public ClassEntity getClassEntity() { return classEntity; }
    public void setClassEntity(ClassEntity classEntity) {
        LOGGER.info("Setting Enrollment.classEntity classId={}", classEntity != null ? classEntity.getClass_id() : null);
        this.classEntity = classEntity;
    }

    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) {
        LOGGER.info("Setting Enrollment.payment paymentId={}", payment != null ? payment.getId() : null);
        this.payment = payment;
    }

    // Convenience ID getters (null-safe)
    public Long getStudentId() { return student != null ? student.getId() : null; }
    public Long getClassId() { return classEntity != null ? classEntity.getClass_id() : null; }
    public Long getPaymentId() { return payment != null ? payment.getId() : null; }

    // Expose denormalized studentNumber
    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) {
        LOGGER.info("Setting Enrollment.studentNumber for enrollment id={} : {}", id, studentNumber);
        this.studentNumber = studentNumber;
    }

    // Dates and status
    // Field names are annotated; keep getters for internal use.
    public LocalDateTime getEnrolledDate() { return enrolledAt; }
    public void setEnrolledDate(LocalDateTime enrolledAt) {
        LOGGER.info("Setting enrolledAt for enrollment id={} : {}", id, enrolledAt);
        this.enrolledAt = enrolledAt;
    }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) {
        LOGGER.info("Setting expiresAt for enrollment id={} : {}", id, expiresAt);
        this.expiresAt = expiresAt;
    }

    public boolean getStatus() { return status; }
    public void setStatus(boolean status) {
        LOGGER.info("Setting status for enrollment id={} : {}", id, status);
        this.status = status;
    }
}
