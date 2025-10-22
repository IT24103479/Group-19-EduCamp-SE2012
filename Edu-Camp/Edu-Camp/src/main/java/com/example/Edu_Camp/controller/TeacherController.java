package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.models.Teacher;
import com.example.Edu_Camp.models.TeacherMaterial;
import com.example.Edu_Camp.repository.MaterialRepository;
import com.example.Edu_Camp.repository.TeacherRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/teachers")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TeacherController {

    private final TeacherRepository teacherRepository;
    private final MaterialRepository materialRepository;

    public TeacherController(TeacherRepository teacherRepository, MaterialRepository materialRepository) {
        this.teacherRepository = teacherRepository;
        this.materialRepository = materialRepository;
    }

    // ✅ Get all teachers
    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    // ✅ Search teachers by subject (address param accepted but not used by repo)
    @GetMapping("/search")
    public List<Teacher> findBySubject(
            @RequestParam String subject,
            @RequestParam(required = false) String address) {
        return teacherRepository.findBySubject(subject);
    }

    // ✅ Get teacher by ID
    @GetMapping("/{id}")
    public ResponseEntity<Teacher> getTeacherById(@PathVariable Long id) {
        Optional<Teacher> teacherOpt = teacherRepository.findById(id);
        return teacherOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ Download a teacher material by material ID
    @GetMapping("/materials/{id}")
    public ResponseEntity<?> getMaterial(@PathVariable Long id) {
        Optional<TeacherMaterial> materialOptional = materialRepository.findById(id);

        if (materialOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TeacherMaterial material = materialOptional.get();

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + material.getFileName() + "\"")
                .header("Content-Type", "application/octet-stream")
                .body(material.getFileData());
    }

    // ✅ Add a new teacher
    @PostMapping
    public Teacher createTeacher(@RequestBody Teacher teacher) {
        System.out.println("📌 Received Teacher: " + teacher.getFirstName() + " " + teacher.getLastName());
        return teacherRepository.save(teacher);
    }

    // ✅ Update a teacher
    @PutMapping("/{id}")
    public Teacher updateTeacher(@PathVariable Long id, @RequestBody Teacher teacher) {
        Teacher existing = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        existing.setFirstName(teacher.getFirstName() + " " + teacher.getLastName());
        existing.setSubject(teacher.getSubject());
        existing.setEmail(teacher.getEmail());
        // ... set other fields you want to allow editing

        return teacherRepository.save(existing);
    }

    // ✅ Delete a teacher
    @DeleteMapping("/{id}")
    public String deleteTeacher(@PathVariable Long id) {
        teacherRepository.deleteById(id);
        return "Teacher with ID " + id + " deleted successfully!";
    }
}