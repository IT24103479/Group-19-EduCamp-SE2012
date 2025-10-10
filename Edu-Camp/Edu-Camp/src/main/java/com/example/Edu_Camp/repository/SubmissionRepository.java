package com.example.Edu_Camp.repository;

import com.example.Edu_Camp.models.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    @Query("""
        SELECT s FROM Submission s
        WHERE s.assignment.id = :assignmentId
          AND s.enrollment.student.id = :studentId
    """)
    Optional<Submission> findByAssignmentIdAndStudentId(@Param("assignmentId") Long assignmentId,
                                                        @Param("studentId") Long studentId);

    @Query("""
        SELECT s FROM Submission s
        WHERE s.enrollment.student.id = :studentId
        ORDER BY s.submittedAt DESC
    """)
    List<Submission> findByStudentIdOrderBySubmittedAtDesc(@Param("studentId") Long studentId);

    @Query("""
        SELECT s FROM Submission s
        WHERE s.assignment.id = :assignmentId
    """)
    List<Submission> findByAssignmentId(@Param("assignmentId") Long assignmentId);

    @Query("""
        SELECT COUNT(s) > 0
        FROM Submission s
        WHERE s.assignment.id = :assignmentId
          AND s.enrollment.student.id = :studentId
    """)
    boolean existsByAssignmentIdAndStudentId(@Param("assignmentId") Long assignmentId,
                                             @Param("studentId") Long studentId);

    @Query("""
        SELECT s FROM Submission s
        WHERE s.enrollment.student.id = :studentId
          AND s.assignment.classEntity.id = :classId
    """)
    List<Submission> findByStudentIdAndClassId(@Param("studentId") Long studentId,
                                               @Param("classId") Long classId);
}
