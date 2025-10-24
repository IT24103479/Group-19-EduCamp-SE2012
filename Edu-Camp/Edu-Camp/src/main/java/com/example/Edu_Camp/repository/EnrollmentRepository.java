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

    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId")
    List<Enrollment> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT e FROM Enrollment e WHERE e.payment.id = :paymentId")
    List<Enrollment> findByPaymentId(@Param("paymentId") Long paymentId);

    @Query("SELECT e FROM Enrollment e WHERE e.classEntity.class_id = :classId")
    List<Enrollment> findByClassId(@Param("classId") Long classId);

    @Query("SELECT e FROM Enrollment e WHERE e.studentNumber = :studentNumber OR e.student.studentNumber = :studentNumber")
    List<Enrollment> findByStudentNumber(@Param("studentNumber") String studentNumber);

    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId AND e.classEntity.class_id = :classId")
    Optional<Enrollment> findByStudentIdAndClassId(@Param("studentId") Long studentId,
                                                   @Param("classId") Long classId);
}