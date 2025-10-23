package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.models.ClassEntity;
import com.example.Edu_Camp.models.Subject;
import com.example.Edu_Camp.models.Teacher;
import com.example.Edu_Camp.repository.ClassRepository;
import com.example.Edu_Camp.repository.SubjectRepository;
import com.example.Edu_Camp.repository.TeacherRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/classes")
@CrossOrigin(origins = "http://localhost:5173")
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
    public ResponseEntity<ClassEntity> getClassById(@PathVariable Long id) {
        return classRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create new class with duplicate check
    @PostMapping
    public ResponseEntity<?> createClass(@RequestBody ClassEntity classEntity) {
        // Fetch managed teacher
        Teacher teacher = teacherRepository.findById(classEntity.getTeacher().getId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Fetch managed subjects
        List<Subject> managedSubjects = classEntity.getSubjects().stream()
                .map(s -> subjectRepository.findById(s.getId())
                        .orElseThrow(() -> new RuntimeException("Subject not found: " + s.getId())))
                .collect(Collectors.toList());

        // Duplicate check: same grade + same teacher + same subjects
        boolean duplicateExists = classRepository.findAll().stream().anyMatch(c -> {
            boolean sameGrade = c.getGrade().equalsIgnoreCase(classEntity.getGrade());
            boolean sameTeacher = c.getTeacher().getId().equals(teacher.getId());

            Set<Long> existingSubjectIds = c.getSubjects().stream()
                    .map(Subject::getId)
                    .collect(Collectors.toSet());
            Set<Long> newSubjectIds = managedSubjects.stream()
                    .map(Subject::getId)
                    .collect(Collectors.toSet());

            boolean sameSubjects = existingSubjectIds.equals(newSubjectIds);

            return sameGrade && sameTeacher && sameSubjects;
        });

        if (duplicateExists) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Duplicate class exists with same grade, teacher, and subjects!");
        }

        classEntity.setTeacher(teacher);
        classEntity.setSubjects(managedSubjects);

        ClassEntity savedClass = classRepository.save(classEntity);
        return ResponseEntity.ok(savedClass);
    }

    // Update class
    @PutMapping("/{id}")
    public ResponseEntity<ClassEntity> updateClass(@PathVariable Long id,
                                                   @RequestBody ClassEntity updatedClass) {
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

            return ResponseEntity.ok(classRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete class
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClass(@PathVariable Long id) {
        if (!classRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        classRepository.deleteById(id);
        return ResponseEntity.ok("Class deleted successfully!");
    }
}
