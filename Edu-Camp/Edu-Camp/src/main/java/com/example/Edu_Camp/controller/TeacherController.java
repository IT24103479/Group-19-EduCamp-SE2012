package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.models.Teacher;
import com.example.Edu_Camp.repository.TeacherRepository;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/teachers")
public class TeacherController {

    private final TeacherRepository teacherRepository;

    public TeacherController(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    // ✅ Get all teachers
    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    // ✅ Get teacher by ID
    @GetMapping("/{id}")
    public Optional<Teacher> getTeacherById(@PathVariable Long id) {
        return teacherRepository.findById(id);
    }

    // ✅ Add a new teacher
    @PostMapping
    public Teacher createTeacher(@RequestBody Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    // ✅ Delete a teacher
    @DeleteMapping("/{id}")
    public String deleteTeacher(@PathVariable Long id) {
        teacherRepository.deleteById(id);
        return "Teacher with ID " + id + " deleted successfully!";
    }

    // ✅ Search teachers by subject and address
    @GetMapping("/search")
    public List<Teacher> findBySubjectAndAddress(
            @RequestParam String subject,
            @RequestParam String address) {
        return teacherRepository.findBySubjectAndAddress(subject, address);
    }
}
