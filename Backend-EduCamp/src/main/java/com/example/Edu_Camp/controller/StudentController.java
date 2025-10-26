package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.dto.StudentProfileDto;
import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.services.AuthService;
import com.example.Edu_Camp.services.StudentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class StudentController {

    private final StudentService studentService;
    private final AuthService authService;

    @Autowired
    public StudentController(StudentService studentService, AuthService authService) {
        this.studentService = studentService;
        this.authService = authService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
            }

            if (!"STUDENT".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied. Student role required."));
            }

            var profile = studentService.getStudentProfile(user);
            return ResponseEntity.ok(Map.of("success", true, "profile", profile));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/today-classes")
    public ResponseEntity<?> getTodaysClasses(HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null || !"STUDENT".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied"));
            }

            var student = studentService.getStudentByUser(user);
            var todayClasses = studentService.getTodaysClasses(student);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "date", java.time.LocalDate.now(),
                    "classes", todayClasses
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody StudentProfileDto profileDto,
                                           BindingResult bindingResult,
                                           HttpServletRequest request) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (var error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Validation failed", "errors", errors));
        }

        try {
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
            }

            if (!"STUDENT".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied. Student role required."));
            }

            var updatedProfile = studentService.updateStudentProfile(user, profileDto);
            return ResponseEntity.ok(Map.of("success", true, "message", "Profile updated successfully", "profile", updatedProfile));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/profile/fields")
    public ResponseEntity<?> getEditableFields(HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            var user = authService.getAuthenticatedUser(sessionId);

            if (user == null || !"STUDENT".equals(user.getRole())) {
                return ResponseEntity.status(401)
                        .body(Map.of("success", false, "message", "Not authenticated as student"));
            }

            // Full list of fields and edit permissions
            Map<String, Boolean> editableFields = new HashMap<>();
            editableFields.put("profilePicture", studentService.canEditField("profilePicture"));
            editableFields.put("phoneNumber", studentService.canEditField("phoneNumber"));
            editableFields.put("emergencyContact", studentService.canEditField("emergencyContact"));
            editableFields.put("address", studentService.canEditField("address"));
            editableFields.put("dateOfBirth", studentService.canEditField("dateOfBirth"));

            // Explicitly mark these as read-only
            editableFields.put("firstName", false);
            editableFields.put("lastName", false);
            editableFields.put("email", false);
            editableFields.put("studentNumber", false);
            editableFields.put("assignedCourses", false);
            editableFields.put("grade", false);
            editableFields.put("updatedAt", false);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "editableFields", editableFields
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }


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