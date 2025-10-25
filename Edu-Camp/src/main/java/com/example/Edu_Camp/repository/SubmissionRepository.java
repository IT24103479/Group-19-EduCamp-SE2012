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

    @Query("SELECT s FROM Submission s WHERE s.assignment.id = :assignmentId AND s.enrollment.id = :enrollmentId")
    Optional<Submission> findByAssignmentIdAndEnrollmentId(@Param("assignmentId") Long assignmentId,
                                                           @Param("enrollmentId") Long enrollmentId);

    @Query("SELECT s FROM Submission s WHERE s.assignment.id = :assignmentId")
    List<Submission> findByAssignmentId(@Param("assignmentId") Long assignmentId);

    @Query("SELECT s FROM Submission s WHERE s.enrollment.student.id = :studentId")
    List<Submission> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT s FROM Submission s WHERE s.assignment.classEntity.teacher.id = :teacherId")
    List<Submission> findByTeacherId(@Param("teacherId") Long teacherId);

    // Option 2: Add this method if you want to use the derived query method
    List<Submission> findByAssignmentClassEntityTeacherId(Long teacherId);
}