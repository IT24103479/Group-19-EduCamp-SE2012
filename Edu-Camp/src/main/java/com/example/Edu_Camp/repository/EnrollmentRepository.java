package com.example.Edu_Camp.repository;

import com.example.Edu_Camp.models.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    @Query("select e from Enrollment e where e.student.id = :studentId")
    List<Enrollment> findByStudentId(@Param("studentId") Long studentId);

    @Query("select e from Enrollment e where e.payment.id = :paymentId")
    List<Enrollment> findByPaymentId(@Param("paymentId") Long paymentId);

    // refer to the ClassEntity property name as defined in the entity class
    @Query("select e from Enrollment e where e.classEntity.id = :classId")
    List<Enrollment> findByClassId(@Param("classId") Long id);

    /**
     * Find enrollments by student number.
     * This query attempts to match either a denormalized studentNumber field on Enrollment
     * or the Student entity's studentNumber (covers both designs).
     */
    @Query("select e from Enrollment e where e.studentNumber = :studentNumber or e.student.studentNumber = :studentNumber")
    List<Enrollment> findByStudentNumber(@Param("studentNumber") String studentNumber);


    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId AND e.classEntity.class_id = :classId")
    Optional<Enrollment> findByStudentIdAndClassId(@Param("studentId") Long studentId,
                                                   @Param("classId") Long classId);
}