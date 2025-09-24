package com.example.Edu_Camp.repository;

import com.example.Edu_Camp.models.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByNameIgnoreCase(String name);
}
