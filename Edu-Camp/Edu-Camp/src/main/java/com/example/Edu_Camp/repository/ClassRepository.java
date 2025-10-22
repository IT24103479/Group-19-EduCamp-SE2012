package com.example.Edu_Camp.repository;

import com.example.Edu_Camp.models.ClassEntity;
import com.example.Edu_Camp.models.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Edu_Camp.models.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

//JPA autamatically generate SQL
public interface ClassRepository extends JpaRepository<ClassEntity, Long> {
    List<ClassEntity> findByGradeContainingIgnoreCase(String grade); //SELECT * FROM class_entity WHERE grade=?
    List<ClassEntity> findByTeacher_FirstNameContainingIgnoreCaseOrTeacher_LastNameContainingIgnoreCase(
            String firstName, String lastName
    );
    List<ClassEntity> findBySubjects_NameContainingIgnoreCase(String name);
}