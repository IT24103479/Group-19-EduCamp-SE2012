package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.dto.AssignmentDto;
import com.example.Edu_Camp.dto.SubmissionDto;
import com.example.Edu_Camp.models.Assignment;
import com.example.Edu_Camp.models.Submission;
import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.repository.AssignmentRepository;
import com.example.Edu_Camp.repository.SubmissionRepository;
import com.example.Edu_Camp.services.AssignmentService;
import com.example.Edu_Camp.services.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teachers")
public class TeacherAssignmentController {

    private final AssignmentService assignmentService;
    private final AuthService authService;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;

    @Autowired
    public TeacherAssignmentController(AssignmentService assignmentService,
                                       AuthService authService,
                                       AssignmentRepository assignmentRepository,
                                       SubmissionRepository submissionRepository) {
        this.assignmentService = assignmentService;
        this.authService = authService;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
    }

    // NEW: Get all assignments for a teacher
    @GetMapping("/assignments")
    public ResponseEntity<?> getTeacherAssignments(HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User teacher = authService.getAuthenticatedUser(sessionId);

            if (teacher == null || !"TEACHER".equals(teacher.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied"));
            }

            List<Assignment> assignments = assignmentService.getTeacherAssignments(teacher.getId());
            List<AssignmentDto> assignmentDtos = assignments.stream()
                    .map(assignmentService::convertToAssignmentDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("success", true, "assignments", assignmentDtos));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // NEW: Get all submissions for a teacher
    @GetMapping("/submissions")
    public ResponseEntity<?> getTeacherSubmissions(HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User teacher = authService.getAuthenticatedUser(sessionId);

            if (teacher == null || !"TEACHER".equals(teacher.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied"));
            }

            List<Submission> submissions = assignmentService.getSubmissionsForTeacher(teacher.getId());
            List<SubmissionDto> submissionDtos = submissions.stream()
                    .map(assignmentService::convertToSubmissionDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("success", true, "submissions", submissionDtos));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // NEW: Create assignment
    @PostMapping(value = "/assignments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createAssignment(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("dueDate") String dueDate,
            @RequestParam("maxPoints") Integer maxPoints,
            @RequestParam("classId") Long classId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User teacher = authService.getAuthenticatedUser(sessionId);

            if (teacher == null || !"TEACHER".equals(teacher.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied"));
            }

            AssignmentDto assignmentDto = new AssignmentDto();
            assignmentDto.setTitle(title);
            assignmentDto.setDescription(description);
            assignmentDto.setDueDate(LocalDateTime.parse(dueDate));
            assignmentDto.setMaxPoints(maxPoints);
            assignmentDto.setClassId(classId);

            Assignment assignment = assignmentService.createAssignment(assignmentDto, teacher.getId(), file);
            AssignmentDto createdAssignmentDto = assignmentService.convertToAssignmentDto(assignment);

            return ResponseEntity.ok(Map.of("success", true, "assignment", createdAssignmentDto));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // NEW: Get submissions for a specific assignment
    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<?> getSubmissionsForAssignment(@PathVariable Long assignmentId,
                                                         HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User teacher = authService.getAuthenticatedUser(sessionId);

            if (teacher == null || !"TEACHER".equals(teacher.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied"));
            }

            List<Submission> submissions = assignmentService.getSubmissionsForAssignment(assignmentId, teacher.getId());
            List<SubmissionDto> submissionDtos = submissions.stream()
                    .map(assignmentService::convertToSubmissionDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("success", true, "submissions", submissionDtos));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // NEW: Grade submission
    @PutMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<?> gradeSubmission(@PathVariable Long submissionId,
                                             @RequestBody Map<String, Object> gradeRequest,
                                             HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User teacher = authService.getAuthenticatedUser(sessionId);

            if (teacher == null || !"TEACHER".equals(teacher.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied"));
            }

            Integer grade = (Integer) gradeRequest.get("grade");
            String feedback = (String) gradeRequest.get("feedback");

            Submission submission = assignmentService.gradeSubmission(submissionId, grade, feedback, teacher.getId());
            SubmissionDto submissionDto = assignmentService.convertToSubmissionDto(submission);

            return ResponseEntity.ok(Map.of("success", true, "submission", submissionDto));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Existing methods below...

    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<?> getSubmission(@PathVariable Long submissionId,
                                           HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User teacher = authService.getAuthenticatedUser(sessionId);

            if (teacher == null || !"TEACHER".equals(teacher.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied"));
            }

            var submission = assignmentService.getSubmissionById(submissionId, teacher.getId());
            var submissionDto = assignmentService.convertToSubmissionDto(submission);

            return ResponseEntity.ok(Map.of("success", true, "submission", submissionDto));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/submissions/{submissionId}/download")
    public ResponseEntity<byte[]> downloadSubmissionFile(@PathVariable Long submissionId,
                                                         HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User teacher = authService.getAuthenticatedUser(sessionId);

            if (teacher == null || !"TEACHER".equals(teacher.getRole())) {
                return ResponseEntity.status(403).build();
            }

            byte[] fileContent = assignmentService.downloadSubmissionFile(submissionId, teacher.getId());
            Submission submission = submissionRepository.findById(submissionId).orElseThrow();

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header("Content-Disposition", "attachment; filename=\"" + submission.getFileName() + "\"")
                    .body(fileContent);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/submissions/{submissionId}/preview")
    public ResponseEntity<byte[]> previewSubmissionFile(@PathVariable Long submissionId,
                                                        HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            User teacher = authService.getAuthenticatedUser(sessionId);

            if (teacher == null || !"TEACHER".equals(teacher.getRole())) {
                return ResponseEntity.status(403).build();
            }

            byte[] fileContent = assignmentService.downloadSubmissionFile(submissionId, teacher.getId());
            Submission submission = submissionRepository.findById(submissionId).orElseThrow();

            MediaType mediaType = assignmentService.getMediaTypeForFile(submission.getFileName());

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header("Content-Disposition", "inline; filename=\"" + submission.getFileName() + "\"")
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