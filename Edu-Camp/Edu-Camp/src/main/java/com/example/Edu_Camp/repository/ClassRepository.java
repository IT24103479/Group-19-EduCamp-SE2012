package com.example.Edu_Camp.repository;

import com.example.Edu_Camp.models.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;//for build in database methods
import java.util.List;

public interface ClassRepository extends JpaRepository<ClassEntity,Long>{
 List<ClassEntity> findBySubjectContainingIgnoreCase(String subject);
}