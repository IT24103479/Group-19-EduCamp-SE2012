package com.example.Edu_Camp.repository;

import com.example.Edu_Camp.models.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

//JPA autamatically generate SQL
public interface ClassRepository extends JpaRepository<ClassEntity, Long> {
    List<ClassEntity> findByGradeContainingIgnoreCase(String grade); //SELECT * FROM class_entity WHERE grade=?
    List<ClassEntity> findBySubjects_NameContainingIgnoreCase(String name);
}