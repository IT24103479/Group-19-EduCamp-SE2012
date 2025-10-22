package com.example.Edu_Camp.services;

import com.example.Edu_Camp.dto.EnrollmentDTO;
import com.example.Edu_Camp.models.Enrollment;
import com.example.Edu_Camp.models.Payment;
import com.example.Edu_Camp.models.Student;
import com.example.Edu_Camp.models.ClassEntity;
import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.repository.EnrollmentRepository;
import com.example.Edu_Camp.repository.PaymentRepository;
import com.example.Edu_Camp.repository.StudentRepository;
import com.example.Edu_Camp.repository.ClassRepository;
import com.example.Edu_Camp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             PaymentRepository paymentRepository,
                             StudentRepository studentRepository,
                             ClassRepository classRepository,
                             UserRepository userRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }

    public Enrollment createEnrollment(EnrollmentDTO dto) {
        // Validate payment exists
        Payment payment = paymentRepository.findById(dto.getPaymentId())
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        // Ensure payment is completed
        boolean completed = payment.isPaymentCompleted();

        if (!completed) {
            throw new IllegalStateException("Payment is not completed");
        }

        // Optional: prevent duplicate enrollment for same student+class
        List<Enrollment> existing = enrollmentRepository.findByStudentId(dto.getStudentId());
        boolean duplicate = existing.stream()
                .anyMatch(e -> dto.getClassId().equals(e.getClassId()));
        if (duplicate) {
            throw new IllegalStateException("Student already enrolled in this class");
        }

        // Create a minimal Enrollment using IDs (entity mapping uses relationships elsewhere)
        Enrollment enrollment = new Enrollment(dto.getStudentId(), dto.getClassId(), dto.getPaymentId());
        return enrollmentRepository.save(enrollment);
    }

    /**
     * Create an Enrollment from an existing completed Payment.
     * This method is transactional and idempotent (if an enrollment for the payment exists it returns it).
     */
    @Transactional
    public Enrollment createFromPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        if (!payment.isPaymentCompleted()) {
            throw new IllegalStateException("Payment is not completed");
        }

        // Idempotency: if an enrollment already references this payment, return it
        List<Enrollment> existingByPayment = enrollmentRepository.findByPaymentId(paymentId);
        if (!existingByPayment.isEmpty()) {
            return existingByPayment.get(0);
        }

        // Resolve user -> student
        Long userId = payment.getUserId();
        Student student = null;
        if (userId != null) {
            student = studentRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found for user id: " + userId));
        } else {
            throw new IllegalArgumentException("Payment does not contain userId/student mapping");
        }

        // Resolve class
        Long classId = payment.getClassId();
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + classId));

        // Optionally resolve user entity
        User user = userRepository.findById(userId).orElse(null);

        // Create enrollment entity linking student, class and payment
        Enrollment enrollment = new Enrollment(student, classEntity, payment, user);
        Enrollment saved = enrollmentRepository.save(enrollment);

        // Update payment with enrollment reference
        payment.setEnrollmentId(saved.getId() == null ? null : saved.getId().toString());
        payment.setEnrollmentDate(saved.getEnrolledDate());
        paymentRepository.save(payment);

        return saved;
    }

    public Optional<Enrollment> getById(Long id) { return enrollmentRepository.findById(id); }
    public List<Enrollment> getByStudentId(Long studentId) { return enrollmentRepository.findByStudentId(studentId); }
    public List<Enrollment> getByPaymentId(Long paymentId) { return enrollmentRepository.findByPaymentId(paymentId); }
    public List<Enrollment> getByClassId(Long classId) { return enrollmentRepository.findByClassId(classId); }

    /**
     * Create an enrollment if it does not already exist.
     * This is idempotent and logs useful diagnostics.
     *
     * @param userId   the authenticated user's id (maps to a Student)
     * @param classId  the class id
     * @param paymentId the payment id
     */
    @Transactional
    public void createEnrollmentIfNotExists(Long userId, Long classId, Long paymentId) {
        try {
            System.out.println("createEnrollmentIfNotExists called with userId=" + userId
                    + ", classId=" + classId + ", paymentId=" + paymentId);

            if (userId == null || classId == null || paymentId == null) {
                System.out.println("createEnrollmentIfNotExists: missing required parameter(s). Aborting.");
                return;
            }

            // If enrollment already exists for this payment, nothing to do
            List<Enrollment> existingByPayment = enrollmentRepository.findByPaymentId(paymentId);
            if (existingByPayment != null && !existingByPayment.isEmpty()) {
                System.out.println("Enrollment already exists for paymentId=" + paymentId + ", id=" + existingByPayment.get(0).getId());
                return;
            }

            // Resolve payment (ensure it exists and completed)
            Payment payment = paymentRepository.findById(paymentId).orElse(null);
            if (payment == null) {
                System.out.println("Payment not found for id=" + paymentId + ". Aborting enrollment creation.");
                return;
            }
            if (!payment.isPaymentCompleted()) {
                System.out.println("Payment not completed for id=" + paymentId + ". Aborting enrollment creation.");
                return;
            }

            // Resolve student from userId
            Student student = studentRepository.findByUserId(userId).orElse(null);
            if (student == null) {
                System.out.println("Student not found for userId=" + userId + ". Aborting enrollment creation.");
                return;
            }

            // Resolve class
            ClassEntity classEntity = classRepository.findById(classId).orElse(null);
            if (classEntity == null) {
                System.out.println("Class not found for id=" + classId + ". Aborting enrollment creation.");
                return;
            }

            // Double-check no existing enrollment for student+class
            List<Enrollment> existingForStudent = enrollmentRepository.findByStudentId(student.getId());
            boolean duplicate = existingForStudent != null && existingForStudent.stream()
                    .anyMatch(e -> classId.equals(e.getClassId()));
            if (duplicate) {
                System.out.println("Student " + student.getId() + " already enrolled in class " + classId + ". Aborting.");
                return;
            }

            // Optionally get User entity (not required)
            User user = userRepository.findById(userId).orElse(null);

            // Create and persist enrollment
            Enrollment enrollment = new Enrollment(student, classEntity, payment, user);
            Enrollment saved = enrollmentRepository.save(enrollment);
            System.out.println("Enrollment created with id=" + (saved != null ? saved.getId() : "null"));

            // Update payment to reference enrollment
            if (saved != null) {
                payment.setEnrollmentId(saved.getId() == null ? null : saved.getId().toString());
                payment.setEnrollmentDate(saved.getEnrolledDate());
                paymentRepository.save(payment);
                System.out.println("Payment updated with enrollment info for paymentId=" + paymentId);
            }
        } catch (Exception ex) {
            System.err.println("Error in createEnrollmentIfNotExists: " + ex.getMessage());
            ex.printStackTrace();
            // swallow or rethrow depending on your desired behavior; capture flow should not crash the payment
        }
    }
}