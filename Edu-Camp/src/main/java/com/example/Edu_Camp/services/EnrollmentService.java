package com.example.Edu_Camp.services;

import com.example.Edu_Camp.dto.EnrollmentDTO;
import com.example.Edu_Camp.models.ClassEntity;
import com.example.Edu_Camp.models.Enrollment;
import com.example.Edu_Camp.models.Payment;
import com.example.Edu_Camp.models.Student;
import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.repository.ClassRepository;
import com.example.Edu_Camp.repository.EnrollmentRepository;
import com.example.Edu_Camp.repository.PaymentRepository;
import com.example.Edu_Camp.repository.StudentRepository;
import com.example.Edu_Camp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Edu_Camp.dto.EnrollmentDTO;
import com.example.Edu_Camp.models.ClassEntity;
import com.example.Edu_Camp.models.Enrollment;
import com.example.Edu_Camp.models.Payment;
import com.example.Edu_Camp.models.Student;
import com.example.Edu_Camp.models.User;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;

/**
 * EnrollmentService - implemented create/update/delete logic used by controller.
 *
 * Notes:
 * - This implementation is defensive: it attempts to resolve student by id, studentNumber or user;
 *   it validates that referenced ClassEntity / Payment / User exist before associating them.
 * - Throws IllegalArgumentException when a referenced resource is not found (controller maps to 404).
 * - Throws IllegalStateException for invalid payloads (controller maps to 400).
 */
@Service
@Transactional
public class EnrollmentService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EnrollmentService.class);

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            StudentRepository studentRepository,
            ClassRepository classRepository,
            PaymentRepository paymentRepository,
            UserRepository userRepository
    ) {
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.classRepository = classRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }

    // Read operations (used by controller)
    public Optional<Enrollment> getById(Long id) {
        return enrollmentRepository.findById(id);
    }

    public List<Enrollment> getByStudentId(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    public List<Enrollment> getByPaymentId(Long paymentId) {
        return enrollmentRepository.findByPaymentId(paymentId);
    }

    public List<Enrollment> getByClassId(Long classId) {
        return enrollmentRepository.findByClassId(classId);
    }

    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    /**
     * Create enrollment.
     * Accepts EnrollmentDTO which may contain studentId, studentNumber, userId, classId, paymentId, status, enrolledAt.
     */
    public Enrollment createEnrollment(EnrollmentDTO dto) {
        // validate minimal required fields
        if (dto == null) {
            throw new IllegalStateException("Missing enrollment payload");
        }
        if (dto.getClassId() == null) {
            throw new IllegalStateException("classId is required");
        }

        // resolve ClassEntity
        ClassEntity classEntity = classRepository.findById(dto.getClassId())
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + dto.getClassId()));

        // resolve Payment (optional)
        Payment payment = null;
        if (dto.getPaymentId() != null) {
            payment = paymentRepository.findById(dto.getPaymentId())
                    .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + dto.getPaymentId()));
        }

        // resolve Student: prefer studentId, then studentNumber, then try to resolve by userId (if provided)
        Student student = null;
        if (dto.getStudentId() != null) {
            student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new IllegalArgumentException("Student not found: " + dto.getStudentId()));
        } else if (dto.getStudentNumber() != null && !dto.getStudentNumber().trim().isEmpty()) {
            student = studentRepository.findByStudentNumber(dto.getStudentNumber().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Student not found for studentNumber: " + dto.getStudentNumber()));
        } else if (dto.getUserId() != null) {
            // try to find a Student associated with this user id
            student = studentRepository.findByUserId(dto.getUserId())
                    .orElse(null);
            // if still null, try to find user (we allow enrollment without a student record only if the service/domain supports)
            if (student == null) {
                // optionally, you could throw here. We'll attempt to find the User for association on Enrollment.user.
                LOGGER.debug("No student found for userId={}, proceeding without student record", dto.getUserId());
            }
        }

        // resolve User (optional) - used to populate Enrollment.user if provided
        User user = null;
        if (dto.getUserId() != null) {
            user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + dto.getUserId()));
        } else if (student != null && student.getId() != null) {
            // if student exists and has a user relation, prefer that
            user = student;
        }

        // create Enrollment entity
        Enrollment enrollment;
        if (student != null || user != null || classEntity != null || payment != null) {
            // prefer constructor that accepts entities when we have them
            enrollment = new Enrollment(student, classEntity, payment, user);
        } else {
            // fallback - create by ids (should not generally happen because classId is required)
            Long studentId = dto.getStudentId();
            Long classId = dto.getClassId();
            Long paymentId = dto.getPaymentId();
            enrollment = new Enrollment(studentId, classId, paymentId);
        }

        // status (optional)
        if (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) {
            Boolean status = parseStatusString(dto.getStatus());
            if (status == null) {
                throw new IllegalStateException("Invalid status value: " + dto.getStatus());
            }
            enrollment.setStatus(status);
        }

        // enrolledAt (optional) - accept ISO date/time
        if (dto.getEnrolledAt() != null && !dto.getEnrolledAt().trim().isEmpty()) {
            try {
                LocalDateTime dt = LocalDateTime.parse(dto.getEnrolledAt().trim());
                enrollment.setEnrolledDate(dt);
                // also set expiresAt if you want to keep default expiry offsets elsewhere
            } catch (DateTimeParseException e) {
                throw new IllegalStateException("Invalid enrolledAt datetime format, expected ISO-8601: " + dto.getEnrolledAt());
            }
        }

        // Ensure denormalized studentNumber is populated from student (prePersist will also handle it)
        if (student != null && student.getStudentNumber() != null) {
            enrollment.setStudentNumber(student.getStudentNumber());
        }

        Enrollment saved = enrollmentRepository.save(enrollment);
        LOGGER.info("Created enrollment id={} studentId={} classId={} paymentId={}", saved.getId(),
                saved.getStudentId(), saved.getClassId(), saved.getPaymentId());
        return saved;
    }

    /**
     * Create enrollment if not exists.
     *
     * Behavior:
     * - If an enrollment linked to the provided paymentId already exists, return it.
     * - Otherwise, if a student (resolved from userId) already has an enrollment for the same classId, return it.
     * - Otherwise create a new enrollment using the provided userId/classId/paymentId.
     *
     * This is intentionally permissive: it will attempt to resolve a Student from the userId; if no Student exists,
     * it will still create an Enrollment associated with the User (if user exists) or by ids where necessary.
     */
    public Enrollment createEnrollmentIfNotExists(Long userId, Long classId, Long paymentId) {
        // 1) If paymentId provided, check by payment
        if (paymentId != null) {
            List<Enrollment> byPayment = enrollmentRepository.findByPaymentId(paymentId);
            if (byPayment != null && !byPayment.isEmpty()) {
                LOGGER.debug("Found existing enrollment by paymentId={} -> enrollmentId={}", paymentId, byPayment.get(0).getId());
                return byPayment.get(0);
            }
        }

        // 2) Try to resolve a Student for the userId (if provided)
        Student student = null;
        if (userId != null) {
            student = studentRepository.findByUserId(userId).orElse(null);
        }

        // 3) If we have a student, check student's enrollments for the same classId
        if (student != null) {
            List<Enrollment> studentEnrollments = enrollmentRepository.findByStudentId(student.getId());
            if (studentEnrollments != null) {
                for (Enrollment e : studentEnrollments) {
                    Long eClassId = e.getClassId();
                    if (classId == null || (eClassId != null && eClassId.equals(classId))) {
                        LOGGER.debug("Found existing enrollment for studentId={} classId={} -> enrollmentId={}", student.getId(), classId, e.getId());
                        return e;
                    }
                }
            }
        }

        // 4) No existing enrollment found — create one.
        EnrollmentDTO dto = new EnrollmentDTO();
        dto.setClassId(classId);
        dto.setPaymentId(paymentId);
        // prefer sending studentId if we resolved student
        if (student != null && student.getId() != null) {
            dto.setStudentId(student.getId());
        } else if (userId != null) {
            dto.setUserId(userId);
        }

        LOGGER.debug("No existing enrollment found; creating new enrollment with userId={}, studentId={}, classId={}, paymentId={}",
                userId, dto.getStudentId(), classId, paymentId);

        return createEnrollment(dto);
    }

    public Enrollment createFromPayment(Long paymentId) {
        if (paymentId == null) {
            throw new IllegalArgumentException("paymentId is required");
        }

        // Resolve the Payment record
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        // Attempt to obtain the classId from the payment. Many code paths in this project use payment.getClassId().
        Long classId = null;
        try {
            classId = payment.getClassId();
        } catch (Throwable t) {
            // If the payment model exposes class via a relationship, try that (best-effort).
            if (payment.getClassId() != null) {
                classId = payment.getClassId();
            }
        }

        if (classId == null) {
            throw new IllegalStateException("Payment does not reference a class (classId missing) for paymentId=" + paymentId);
        }

        // We attempt to derive a userId from the payment if available (best-effort).
        Long userId = null;
        try {
            // many payment implementations include user or userId; this is permissive
            if (payment.getUserId() != null) {
                userId = payment.getUserId();
            } else {
                // fallback to a direct userId getter if present
                userId = payment.getUserId();
            }
        } catch (Throwable ignored) {
            // ignore — userId remains null if not present on Payment
        }

        LOGGER.debug("Creating enrollment from paymentId={} (classId={}, userId={})", paymentId, classId, userId);

        // Delegate to createEnrollmentIfNotExists which will return an existing enrollment if present
        return createEnrollmentIfNotExists(userId, classId, paymentId);
    }

    /**
     * Update an existing enrollment. Only fields present in the DTO will be updated.
     */
    public Enrollment updateEnrollment(Long id, EnrollmentDTO dto) {
        Enrollment existing = enrollmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Enrollment not found: " + id));

        if (dto == null) {
            throw new IllegalStateException("Missing enrollment payload");
        }

        // update student if provided (either by id or by studentNumber)
        if (dto.getStudentId() != null) {
            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new IllegalArgumentException("Student not found: " + dto.getStudentId()));
            existing.setStudent(student);
            existing.setStudentNumber(student.getStudentNumber());
        } else if (dto.getStudentNumber() != null && !dto.getStudentNumber().trim().isEmpty()) {
            Student student = studentRepository.findByStudentNumber(dto.getStudentNumber().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Student not found for studentNumber: " + dto.getStudentNumber()));
            existing.setStudent(student);
            existing.setStudentNumber(student.getStudentNumber());
        }

        // update class
        if (dto.getClassId() != null) {
            ClassEntity cls = classRepository.findById(dto.getClassId())
                    .orElseThrow(() -> new IllegalArgumentException("Class not found: " + dto.getClassId()));
            existing.setClassEntity(cls);
        }

        // update payment
        if (dto.getPaymentId() != null) {
            Payment payment = paymentRepository.findById(dto.getPaymentId())
                    .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + dto.getPaymentId()));
            existing.setPayment(payment);
        }

        // update user association
        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + dto.getUserId()));
            existing.setUser(user);
        }

        // status
        if (dto.getStatus() != null) {
            Boolean status = parseStatusString(dto.getStatus());
            if (status == null) {
                throw new IllegalStateException("Invalid status value: " + dto.getStatus());
            }
            existing.setStatus(status);
        }

        // enrolledAt
        if (dto.getEnrolledAt() != null && !dto.getEnrolledAt().trim().isEmpty()) {
            try {
                LocalDateTime dt = LocalDateTime.parse(dto.getEnrolledAt().trim());
                existing.setEnrolledDate(dt);
            } catch (DateTimeParseException e) {
                throw new IllegalStateException("Invalid enrolledAt datetime format, expected ISO-8601: " + dto.getEnrolledAt());
            }
        }

        Enrollment saved = enrollmentRepository.save(existing);
        LOGGER.info("Updated enrollment id={}", saved.getId());
        return saved;
    }

    /**
     * Delete an enrollment by id.
     */
    public void deleteEnrollment(Long id) {
        if (!enrollmentRepository.existsById(id)) {
            throw new IllegalArgumentException("Enrollment not found: " + id);
        }
        enrollmentRepository.deleteById(id);
        LOGGER.info("Deleted enrollment id={}", id);
    }

    /**
     * Helper to parse status strings like "true","false","1","0","active","inactive"
     */
    private Boolean parseStatusString(String s) {
        if (s == null) return null;
        String v = s.trim().toLowerCase();
        if (v.isEmpty()) return null;
        switch (v) {
            case "true":
            case "1":
            case "yes":
            case "y":
            case "active":
            case "on":
                return Boolean.TRUE;
            case "false":
            case "0":
            case "no":
            case "n":
            case "inactive":
            case "off":
                return Boolean.FALSE;
            default:
                return null;
        }
    }
}