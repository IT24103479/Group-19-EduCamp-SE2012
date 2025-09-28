package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.dto.StudentProfileDto;
import com.example.Edu_Camp.models.Student;
import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.service.AuthService;
import com.example.Edu_Camp.service.StudentService;
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
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private AuthService authService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null) {
                return ResponseEntity.status(401).body(
                        Map.of("success", false, "message", "Not authenticated")
                );
            }

            Student student = studentService.getStudentByUser(user);
            return ResponseEntity.ok(Map.of("success", true, "student", student));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody StudentProfileDto profileDto,
                                           BindingResult bindingResult,
                                           HttpServletRequest request) {
        // Validation
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (var error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Validation failed", "errors", errors)
            );
        }

        try {
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null) {
                return ResponseEntity.status(401).body(
                        Map.of("success", false, "message", "Not authenticated")
                );
            }

            Student updatedStudent = studentService.updateStudentProfile(user, profileDto);
            return ResponseEntity.ok(
                    Map.of("success", true, "message", "Profile updated successfully", "student", updatedStudent)
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage())
            );
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
        return request.getHeader("X-Session-Id");
    }
}