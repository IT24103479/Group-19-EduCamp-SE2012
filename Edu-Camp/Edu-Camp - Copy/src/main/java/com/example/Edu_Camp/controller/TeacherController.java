package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.models.Subject;
import com.example.Edu_Camp.models.Teacher;
import com.example.Edu_Camp.repository.SubjectRepository;
import com.example.Edu_Camp.repository.TeacherRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teachers")
@CrossOrigin(origins="http://localhost:5173")
public class TeacherController {

    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;

    public TeacherController(TeacherRepository teacherRepository, SubjectRepository subjectRepository) {
        this.teacherRepository = teacherRepository;
        this.subjectRepository = subjectRepository;
    }

    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    @GetMapping("/{id}")
    public Teacher getTeacher(@PathVariable Long id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
    }

    @PostMapping
    public Teacher createTeacher(@RequestBody Teacher teacher) {
        if (teacher.getSubject() != null && teacher.getSubject().getId() != null) {
            Subject subject = subjectRepository.findById(teacher.getSubject().getId())
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            teacher.setSubject(subject);
        }
        return teacherRepository.save(teacher);
    }

    @PutMapping("/{id}")
    public Teacher updateTeacher(@PathVariable Long id, @RequestBody Teacher teacher) {
        Teacher existing = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        existing.setName(teacher.getName());
        existing.setEmail(teacher.getEmail());
        existing.setPhone(teacher.getPhone());
        existing.setQualification(teacher.getQualification());
        existing.setB_day(teacher.getB_day());
        existing.setImage(teacher.getImage());

        if (teacher.getSubject() != null && teacher.getSubject().getId() != null) {
            Subject subject = subjectRepository.findById(teacher.getSubject().getId())
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            existing.setSubject(subject);
        }

        return teacherRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteTeacher(@PathVariable Long id) {
        teacherRepository.deleteById(id);
        return "Teacher with ID " + id + " deleted successfully!";
    }

    @GetMapping("/search")
    public List<Teacher> findBySubject(@RequestParam Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        return teacherRepository.findBySubject(subject);
    }
}
