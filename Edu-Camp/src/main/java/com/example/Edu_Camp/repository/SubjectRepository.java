package com.example.Edu_Camp.repository;

import com.example.Edu_Camp.models.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
}