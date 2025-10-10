package com.example.Edu_Camp.service;

import com.example.Edu_Camp.dto.SubmissionResponseDto;
import com.example.Edu_Camp.models.*;
import com.example.Edu_Camp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    public SubmissionResponseDto submitAssignment(Long assignmentId, User user, MultipartFile file, String comments) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        Enrollment enrollment = enrollmentRepository.findActiveEnrollment(
                        student.getId(), assignment.getClassEntity().getId())
                .orElseThrow(() -> new RuntimeException("You are not actively enrolled in this class"));

        if (submissionRepository.existsByAssignmentIdAndStudentId(assignmentId, student.getId())) {
            throw new RuntimeException("Assignment already submitted");
        }

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is required");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("File size must be less than 10MB");
        }

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName = Optional.ofNullable(file.getOriginalFilename()).orElse("file");
            String extension = originalFileName.contains(".")
                    ? originalFileName.substring(originalFileName.lastIndexOf("."))
                    : "";
            String uniqueFileName = UUID.randomUUID() + extension;
            Path destinationFile = uploadPath.resolve(uniqueFileName).normalize();

            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            Submission submission = new Submission();
            submission.setAssignment(assignment);
            submission.setEnrollment(enrollment);
            submission.setFilePath(uniqueFileName);
            submission.setFileName(originalFileName);
            submission.setFileSize(file.getSize());
            submission.setComments(comments);
            submission.setStatus("SUBMITTED");
            submission.setSubmittedAt(LocalDateTime.now());

            Submission saved = submissionRepository.save(submission);
            return convertToDto(saved);

        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }
    }

    public List<SubmissionResponseDto> getStudentSubmissions(User user) {
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        List<Submission> submissions = submissionRepository.findByStudentIdOrderBySubmittedAtDesc(student.getId());

        return submissions.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public SubmissionResponseDto getSubmission(Long submissionId, User user) {
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (!submission.getEnrollment().getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Access denied");
        }

        boolean isEnrolled = enrollmentRepository.existsActiveEnrollment(
                student.getId(), submission.getAssignment().getClassEntity().getId());

        if (!isEnrolled) {
            throw new RuntimeException("You are no longer enrolled in this class");
        }

        return convertToDto(submission);
    }

    public Resource downloadSubmissionFile(Long submissionId, User user) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        if (!submission.getEnrollment().getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Access denied");
        }

        boolean isEnrolled = enrollmentRepository.existsActiveEnrollment(
                student.getId(), submission.getAssignment().getClassEntity().getId());

        if (!isEnrolled) {
            throw new RuntimeException("You are no longer enrolled in this class");
        }

        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize()
                    .resolve(submission.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or unreadable");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file: " + e.getMessage());
        }
    }

    public List<SubmissionResponseDto> getAvailableAssignments(User user) {
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        List<Enrollment> activeEnrollments = enrollmentRepository.findActiveEnrollmentsByStudent(student.getId());
        if (activeEnrollments.isEmpty()) return Collections.emptyList();

        List<Long> classIds = activeEnrollments.stream()
                .map(e -> e.getClassEntity().getId())
                .collect(Collectors.toList());

        List<Assignment> assignments = assignmentRepository.findByClassIds(classIds);

        return assignments.stream()
                .filter(a -> {
                    boolean notSubmitted = !submissionRepository.existsByAssignmentIdAndStudentId(a.getId(), student.getId());
                    boolean notDue = a.getDueDate() == null || a.getDueDate().isAfter(LocalDateTime.now());
                    return notSubmitted && notDue;
                })
                .map(a -> {
                    SubmissionResponseDto dto = new SubmissionResponseDto();
                    dto.setAssignmentId(a.getId());
                    dto.setAssignmentTitle(a.getTitle());
                    dto.setClassName(a.getClassEntity().getGrade());
                    dto.setDueDate(a.getDueDate());
                    dto.setMaxPoints(a.getMaxPoints());
                    dto.setStatus("AVAILABLE");
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private SubmissionResponseDto convertToDto(Submission s) {
        SubmissionResponseDto dto = new SubmissionResponseDto();
        dto.setId(s.getId());
        dto.setAssignmentId(s.getAssignment().getId());
        dto.setAssignmentTitle(s.getAssignment().getTitle());
        dto.setClassName(s.getAssignment().getClassEntity().getGrade());
        dto.setFileName(s.getFileName());
        dto.setFilePath(s.getFilePath());
        dto.setFileSize(s.getFileSize());
        dto.setComments(s.getComments());
        dto.setStatus(s.getStatus());
        dto.setGrade(s.getGrade());
        dto.setFeedback(s.getFeedback());
        dto.setSubmittedAt(s.getSubmittedAt());
        dto.setGradedAt(s.getGradedAt());
        dto.setStudentName(s.getEnrollment().getStudent().getUser().getFirstName() + " " +
                s.getEnrollment().getStudent().getUser().getLastName());
        dto.setLate(s.isLate());
        dto.setDueDate(s.getAssignment().getDueDate());
        dto.setMaxPoints(s.getAssignment().getMaxPoints());
        return dto;
    }

    public List<SubmissionResponseDto> getSubmissionsByClass(Long classId, User user) {
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        boolean isEnrolled = enrollmentRepository.existsActiveEnrollment(student.getId(), classId);
        if (!isEnrolled) {
            throw new RuntimeException("You are not enrolled in this class");
        }

        List<Submission> submissions = submissionRepository.findByStudentIdAndClassId(student.getId(), classId);
        return submissions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
}
