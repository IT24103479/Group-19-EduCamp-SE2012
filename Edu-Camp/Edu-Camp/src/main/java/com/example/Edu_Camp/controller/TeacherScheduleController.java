package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.models.TeacherSchedule;
import com.example.Edu_Camp.repository.TeacherScheduleRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class TeacherScheduleController {

    private final TeacherScheduleRepository scheduleRepository;

    public TeacherScheduleController(TeacherScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    @GetMapping
    public List<TeacherSchedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    @PostMapping
    public TeacherSchedule createSchedule(@RequestBody TeacherSchedule schedule) {
        return scheduleRepository.save(schedule);
    }
}
