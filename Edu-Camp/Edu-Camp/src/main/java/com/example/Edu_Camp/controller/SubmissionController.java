package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.service.AuthService;
import com.example.Edu_Camp.service.SubmissionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private AuthService authService;

    @PostMapping(value = "/assignments/{assignmentId}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "comments", required = false) String comments,
            HttpServletRequest request) {

        try {
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null) {
                return ResponseEntity.status(401).body(
                        Map.of("success", false, "message", "Not authenticated")
                );
            }

            var submission = submissionService.submitAssignment(assignmentId, user, file, comments);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Assignment submitted successfully",
                    "submission", submission
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    @GetMapping("/submissions")
    public ResponseEntity<?> getMySubmissions(HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null) {
                return ResponseEntity.status(401).body(
                        Map.of("success", false, "message", "Not authenticated")
                );
            }

            var submissions = submissionService.getStudentSubmissions(user);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "submissions", submissions
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    @GetMapping("/assignments/available")
    public ResponseEntity<?> getAvailableAssignments(HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null) {
                return ResponseEntity.status(401).body(
                        Map.of("success", false, "message", "Not authenticated")
                );
            }

            var assignments = submissionService.getAvailableAssignments(user);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "assignments", assignments
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<?> getSubmission(
            @PathVariable Long submissionId,
            HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null) {
                return ResponseEntity.status(401).body(
                        Map.of("success", false, "message", "Not authenticated")
                );
            }

            var submission = submissionService.getSubmission(submissionId, user);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "submission", submission
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    @GetMapping("/classes/{classId}/submissions")
    public ResponseEntity<?> getSubmissionsByClass(
            @PathVariable Long classId,
            HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null) {
                return ResponseEntity.status(401).body(
                        Map.of("success", false, "message", "Not authenticated")
                );
            }

            var submissions = submissionService.getSubmissionsByClass(classId, user);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "submissions", submissions
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    @GetMapping("/submissions/{submissionId}/download")
    public ResponseEntity<?> downloadSubmissionFile(
            @PathVariable Long submissionId,
            HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User user = authService.getAuthenticatedUser(sessionId);

            if (user == null) {
                return ResponseEntity.status(401).body(
                        Map.of("success", false, "message", "Not authenticated")
                );
            }

            Resource fileResource = submissionService.downloadSubmissionFile(submissionId, user);
            String filename = fileResource.getFilename();

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(fileResource);

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
