package com.example.Edu_Camp.repository;

import com.example.Edu_Camp.models.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    @Query("SELECT a FROM Assignment a WHERE a.classEntity.class_id = :classId")
    List<Assignment> findByClassId(@Param("classId") Long classId);

    @Query("SELECT a FROM Assignment a WHERE a.classEntity.teacher.id = :teacherId")
    List<Assignment> findByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT a FROM Assignment a WHERE a.classEntity.class_id IN " +
            "(SELECT e.classEntity.class_id FROM Enrollment e WHERE e.student.id = :studentId)")
    List<Assignment> findAssignmentsForStudent(@Param("studentId") Long studentId);
}