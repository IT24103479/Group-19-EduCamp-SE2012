package com.example.Edu_Camp.repository;

import com.example.Edu_Camp.models.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByTeacherNumber(String teacherNumber);
    Optional<Teacher> findByEmail(String email);
    boolean existsByTeacherNumber(String teacherNumber);
    boolean existsByEmail(String email);
    @Query("SELECT t FROM Teacher t WHERE t.subjectName = :subjectName")
    List<Teacher> findBySubjectName(@Param("subjectName") String subjectName);
}
