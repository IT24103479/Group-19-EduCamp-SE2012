package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.models.ClassEntity;
import com.example.Edu_Camp.models.Subject;
import com.example.Edu_Camp.models.Teacher;
import com.example.Edu_Camp.repository.ClassRepository;
import com.example.Edu_Camp.repository.SubjectRepository;
import com.example.Edu_Camp.repository.TeacherRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/classes")
@CrossOrigin(origins="http://localhost:5173")
public class ClassController {

    private final ClassRepository classRepository;
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;

    public ClassController(ClassRepository classRepository,
                           TeacherRepository teacherRepository,
                           SubjectRepository subjectRepository) {
        this.classRepository = classRepository;
        this.teacherRepository = teacherRepository;
        this.subjectRepository = subjectRepository;
    }

    // Get all classes
    @GetMapping
    public List<ClassEntity> getAllClasses() {
        return classRepository.findAll();
    }

    // Get class by ID
    @GetMapping("/{id}")
    public ClassEntity getClassById(@PathVariable Long id) {
        return classRepository.findById(id).orElse(null);
    }

    // Create new class
    @PostMapping
    public ClassEntity createClass(@RequestBody ClassEntity classEntity) {
        // Fetch managed teacher
        Teacher teacher = teacherRepository.findById(classEntity.getTeacher().getId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Fetch managed subjects
        List<Subject> managedSubjects = classEntity.getSubjects().stream()
                .map(s -> subjectRepository.findById(s.getId())
                        .orElseThrow(() -> new RuntimeException("Subject not found: " + s.getId())))
                .collect(Collectors.toList());

        classEntity.setTeacher(teacher);
        classEntity.setSubjects(managedSubjects);

        return classRepository.save(classEntity);
    }

    // Update class
    @PutMapping("/{id}")
    public ClassEntity updateClass(@PathVariable Long id, @RequestBody ClassEntity updatedClass) {
        return classRepository.findById(id).map(c -> {
            c.setGrade(updatedClass.getGrade());
            c.setFee(updatedClass.getFee());
            c.setTimetable(updatedClass.getTimetable());

            Teacher teacher = teacherRepository.findById(updatedClass.getTeacher().getId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            c.setTeacher(teacher);

            List<Subject> managedSubjects = updatedClass.getSubjects().stream()
                    .map(s -> subjectRepository.findById(s.getId())
                            .orElseThrow(() -> new RuntimeException("Subject not found: " + s.getId())))
                    .collect(Collectors.toList());
            c.setSubjects(managedSubjects);

            return classRepository.save(c);
        }).orElse(null);
    }

    // Delete class
    @DeleteMapping("/{id}")
    public void deleteClass(@PathVariable Long id) {
        classRepository.deleteById(id);
    }
}
