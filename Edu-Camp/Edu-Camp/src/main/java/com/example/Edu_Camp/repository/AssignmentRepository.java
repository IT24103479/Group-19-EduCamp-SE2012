package com.example.Edu_Camp.repository;

import com.example.Edu_Camp.models.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findAllByOrderByDueDateAsc();

    @Query("SELECT a FROM Assignment a WHERE a.classEntity.id IN :classIds")
    List<Assignment> findByClassIds(@Param("classIds") List<Long> classIds);

    @Query("SELECT a FROM Assignment a WHERE a.classEntity.id = :classId")
    List<Assignment> findByClassId(@Param("classId") Long classId);
}
