package com.example.Edu_Camp.repository;

import com.example.Edu_Camp.models.TeacherMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialRepository extends JpaRepository<TeacherMaterial, Long> {
}

