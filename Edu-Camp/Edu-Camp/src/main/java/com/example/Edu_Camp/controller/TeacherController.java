package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.dto.TeacherDto;
import com.example.Edu_Camp.models.Teacher;
import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.repository.TeacherRepository;
import com.example.Edu_Camp.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class TeacherController {

    private final TeacherRepository teacherRepository;
    private final AuthService authService;

    public TeacherController(TeacherRepository teacherRepository, AuthService authService) {
        this.teacherRepository = teacherRepository;
        this.authService = authService;
    }

    //  Get all teachers (Admin only)
    @GetMapping
    public ResponseEntity<?> getAllTeachers(HttpServletRequest request) {
        try {
            // Check authentication and authorization
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
            }

            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied. Admin role required."));
            }

            List<Teacher> teachers = teacherRepository.findAll();

            // Convert to DTO to avoid exposing sensitive data
            List<TeacherDto> teacherDTOs = teachers.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("success", true, "teachers", teacherDTOs));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    //  Get teacher by ID (Admin only)
    @GetMapping("/{id}")
    public ResponseEntity<?> getTeacher(@PathVariable Long id, HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
            }

            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied. Admin role required."));
            }

            Optional<Teacher> teacherOptional = teacherRepository.findById(id);
            if (teacherOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Teacher not found"));
            }

            Teacher teacher = teacherOptional.get();
            TeacherDto teacherDTO = convertToDTO(teacher);
            return ResponseEntity.ok(Map.of("success", true, "teacher", teacherDTO));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    //  Update teacher (Admin only)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTeacher(
            @PathVariable Long id,
            @RequestBody TeacherDto updatedTeacher,
            HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
            }

            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied. Admin role required."));
            }

            Optional<Teacher> teacherOptional = teacherRepository.findById(id);
            if (teacherOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Teacher not found"));
            }

            Teacher teacher = teacherOptional.get();

            // Update fields
            if (updatedTeacher.getPhoneNumber() != null) {
                teacher.setPhoneNumber(updatedTeacher.getPhoneNumber());
            }
            if (updatedTeacher.getQualification() != null) {
                teacher.setQualification(updatedTeacher.getQualification());
            }
            if (updatedTeacher.getImage() != null) {
                teacher.setImage(updatedTeacher.getImage());
            }
            if (updatedTeacher.getSubjectName() != null) {
                teacher.setSubjectName(updatedTeacher.getSubjectName());
            }

            Teacher savedTeacher = teacherRepository.save(teacher);
            TeacherDto teacherDTO = convertToDTO(savedTeacher);

            return ResponseEntity.ok(Map.of("success", true, "message", "Teacher updated successfully", "teacher", teacherDTO));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    //  Search teachers by subject (Admin only)
    @GetMapping("/search")
    public ResponseEntity<?> findTeachersBySubject(
            @RequestParam String subject,
            HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
            }

            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied. Admin role required."));
            }

            List<Teacher> teachers = teacherRepository.findBySubjectName(subject);
            List<TeacherDto> teacherDTOs = teachers.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("success", true, "teachers", teacherDTOs));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    //  Delete a teacher (Admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id, HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
            }

            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied. Admin role required."));
            }

            if (!teacherRepository.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Teacher not found"));
            }

            teacherRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Teacher deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Helper method to convert Teacher to DTO
    private TeacherDto convertToDTO(Teacher teacher) {
        TeacherDto dto = new TeacherDto();
        dto.setId(teacher.getId());
        dto.setFirstName(teacher.getFirstName());
        dto.setLastName(teacher.getLastName());
        dto.setEmail(teacher.getEmail());
        dto.setPhoneNumber(teacher.getPhoneNumber());
        dto.setQualification(teacher.getQualification());
        dto.setDateOfBirth(teacher.getDateOfBirth());
        dto.setImage(teacher.getImage());
        dto.setSubjectName(teacher.getSubjectName());
        dto.setTeacherNumber(teacher.getTeacherNumber());
        dto.setJoinDate(teacher.getJoinDate());
        return dto;
    }

    // Extract session ID (same as in your other controllers)
    private String extractSessionId(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("sessionId".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return request.getHeader("X-Session-Id");
    }
}
