package com.example.Edu_Camp.repository;

import com.example.Edu_Camp.models.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Subject findByName(String name);
    boolean existsByName(String name);
}
