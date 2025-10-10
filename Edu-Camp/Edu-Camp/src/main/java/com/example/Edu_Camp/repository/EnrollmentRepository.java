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

    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId AND e.classEntity.id = :classId AND e.status = true AND e.expiresAt > CURRENT_TIMESTAMP")
    Optional<Enrollment> findActiveEnrollment(@Param("studentId") Long studentId, @Param("classId") Long classId);

    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId AND e.status = true AND e.expiresAt > CURRENT_TIMESTAMP")
    List<Enrollment> findActiveEnrollmentsByStudent(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(e) > 0 FROM Enrollment e WHERE e.student.id = :studentId AND e.classEntity.id = :classId AND e.status = true AND e.expiresAt > CURRENT_TIMESTAMP")
    boolean existsActiveEnrollment(@Param("studentId") Long studentId, @Param("classId") Long classId);
}
