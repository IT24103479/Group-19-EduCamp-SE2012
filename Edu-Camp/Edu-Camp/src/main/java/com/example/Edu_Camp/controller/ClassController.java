package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.models.ClassEntity;
import com.example.Edu_Camp.models.ClassItemDTO;
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
//@CrossOrigin(origins="http://localhost:5173")
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
    public List<ClassItemDTO> getAllClasses() {
        return classRepository.findAll().stream().map(classEntity -> {
            ClassItemDTO dto = new ClassItemDTO();
            dto.class_id = classEntity.getClass_id();
            // Use subject names as class name
            if (classEntity.getSubjects() != null && !classEntity.getSubjects().isEmpty()) {
                dto.name = classEntity.getName();  // ✅ use real field now

            } else {
                dto.name = "Unnamed Class";
            }
            dto.grade = classEntity.getGrade();
            dto.image = ""; // Placeholder, adjust as needed
            dto.timetable = classEntity.getTimetable();
            dto.grade = classEntity.getGrade();
            dto.fee = String.valueOf(classEntity.getFee());
            dto.teacher_id = classEntity.getTeacher().getId();
            dto.teacher_name = classEntity.getTeacher().getFirstName();

            // Build subject id list safely (avoid NPE) and assign to DTO field
            List<Long> subjectIds = classEntity.getSubjects() == null
                    ? java.util.Collections.emptyList()
                    : classEntity.getSubjects().stream()
                    .map(Subject::getId)
                    .collect(Collectors.toList());

            // subjectIds is a field on the DTO (not a method) — assign it
            dto.subjectIds = subjectIds;

            // Build subject name list (map id -> name) for frontend convenience
            List<String> subjectNames = classEntity.getSubjects() == null
                    ? java.util.Collections.emptyList()
                    : classEntity.getSubjects().stream()
                    .map(Subject::getName)
                    .collect(Collectors.toList());

            dto.subjectNames = subjectNames;

            return dto;
        }).collect(Collectors.toList());
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

        ClassEntity cls = new ClassEntity();
        cls.setGrade(classEntity.getGrade());
        cls.setFee(classEntity.getFee());
        cls.setTimetable(classEntity.getTimetable());
        // Use the managed instances we fetched above
        cls.setTeacher(teacher);
        cls.setSubjects(managedSubjects);

        return classRepository.save(cls);
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
        }).orElseThrow(() -> new RuntimeException("Class not found"));
    }

    // Delete class
    @DeleteMapping("/{id}")
    public void deleteClass(@PathVariable Long id) {
        classRepository.deleteById(id);
    }
}