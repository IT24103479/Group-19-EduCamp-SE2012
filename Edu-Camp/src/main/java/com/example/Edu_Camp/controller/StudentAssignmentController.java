package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.dto.AssignmentDto;
import com.example.Edu_Camp.dto.SubmissionDto;
import com.example.Edu_Camp.models.Assignment;
import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.repository.AssignmentRepository;
import com.example.Edu_Camp.repository.EnrollmentRepository;
import com.example.Edu_Camp.services.AssignmentService;
import com.example.Edu_Camp.services.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
public class StudentAssignmentController {

    private final AssignmentService assignmentService;
    private final AuthService authService;
    private final AssignmentRepository assignmentRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Autowired
    public StudentAssignmentController(AssignmentService assignmentService,
                                       AuthService authService,
                                       AssignmentRepository assignmentRepository,
                                       EnrollmentRepository enrollmentRepository) {
        this.assignmentService = assignmentService;
        this.authService = authService;
        this.assignmentRepository = assignmentRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @GetMapping("/assignments")
    public ResponseEntity<?> getStudentAssignments(HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User student = authService.getAuthenticatedUser(sessionId);

            if (student == null || !"STUDENT".equals(student.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied"));
            }

            var assignments = assignmentService.getStudentAssignments(student.getId());
            var assignmentDtos = assignments.stream()
                    .map(assignmentService::convertToAssignmentDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("success", true, "assignments", assignmentDtos));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/assignments/{assignmentId}")
    public ResponseEntity<?> getAssignmentDetails(@PathVariable Long assignmentId,
                                                  HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User student = authService.getAuthenticatedUser(sessionId);

            if (student == null || !"STUDENT".equals(student.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied"));
            }

            Assignment assignment = assignmentService.getAssignmentById(assignmentId);

            boolean isEnrolled = enrollmentRepository
                    .findByStudentIdAndClassId(student.getId(), assignment.getClassEntity().getClass_id())
                    .isPresent();

            if (!isEnrolled) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "You are not enrolled in this class"));
            }

            var assignmentDto = assignmentService.convertToAssignmentDto(assignment);

            return ResponseEntity.ok(Map.of("success", true, "assignment", assignmentDto));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<?> submitAssignment(@PathVariable Long assignmentId,
                                              @RequestParam("file") MultipartFile file,
                                              @RequestParam(value = "comments", required = false) String comments,
                                              HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User student = authService.getAuthenticatedUser(sessionId);

            if (student == null || !"STUDENT".equals(student.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied"));
            }

            var submission = assignmentService.submitAssignment(
                    assignmentId, student.getId(), file, comments
            );

            var submissionDto = assignmentService.convertToSubmissionDto(submission);
            return ResponseEntity.ok(Map.of("success", true, "submission", submissionDto));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ADD SUBMISSIONS ENDPOINT HERE - This is the correct place for it!
    @GetMapping("/submissions")
    public ResponseEntity<?> getStudentSubmissions(HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User student = authService.getAuthenticatedUser(sessionId);

            if (student == null || !"STUDENT".equals(student.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied"));
            }

            var submissions = assignmentService.getStudentSubmissions(student.getId());
            var submissionDtos = submissions.stream()
                    .map(assignmentService::convertToSubmissionDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("success", true, "submissions", submissionDtos));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/assignments/{assignmentId}/download")
    public ResponseEntity<byte[]> downloadAssignmentFile(@PathVariable Long assignmentId,
                                                         HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User student = authService.getAuthenticatedUser(sessionId);

            if (student == null || !"STUDENT".equals(student.getRole())) {
                return ResponseEntity.status(403).build();
            }

            byte[] fileContent = assignmentService.downloadAssignmentFile(assignmentId, student.getId());
            Assignment assignment = assignmentRepository.findById(assignmentId).orElseThrow();

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header("Content-Disposition", "attachment; filename=\"" + assignment.getFileName() + "\"")
                    .body(fileContent);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/assignments/{assignmentId}/preview")
    public ResponseEntity<byte[]> previewAssignmentFile(@PathVariable Long assignmentId,
                                                        HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User student = authService.getAuthenticatedUser(sessionId);

            if (student == null || !"STUDENT".equals(student.getRole())) {
                return ResponseEntity.status(403).build();
            }

            byte[] fileContent = assignmentService.downloadAssignmentFile(assignmentId, student.getId());
            Assignment assignment = assignmentRepository.findById(assignmentId).orElseThrow();

            MediaType mediaType = assignmentService.getMediaTypeForFile(assignment.getFileName());

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header("Content-Disposition", "inline; filename=\"" + assignment.getFileName() + "\"")
                    .body(fileContent);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
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