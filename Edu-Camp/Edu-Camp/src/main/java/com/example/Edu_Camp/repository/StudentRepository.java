package com.example.Edu_Camp.repository;

import com.example.Edu_Camp.models.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentNumber(String studentNumber);
    Optional<Student> findByEmail(String email);
    boolean existsByStudentNumber(String studentNumber);
    boolean existsByEmail(String email);

    @Query("SELECT s FROM Student s WHERE s.id = :userId")
    Optional<Student> findByUserId(@Param("userId") Long userId);
}