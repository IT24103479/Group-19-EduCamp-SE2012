package com.example.Edu_Camp.repository;

import com.example.Edu_Camp.models.TeacherSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherScheduleRepository extends JpaRepository<TeacherSchedule, Long> {
}