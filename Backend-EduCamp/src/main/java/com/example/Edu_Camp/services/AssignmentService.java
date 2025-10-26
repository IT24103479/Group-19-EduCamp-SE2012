package com.example.Edu_Camp.services;

import com.example.Edu_Camp.dto.AssignmentDto;
import com.example.Edu_Camp.dto.SubmissionDto;
import com.example.Edu_Camp.models.*;
import com.example.Edu_Camp.repository.*;
import com.example.Edu_Camp.services.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final ClassRepository classRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    public AssignmentService(AssignmentRepository assignmentRepository,
                             SubmissionRepository submissionRepository,
                             ClassRepository classRepository,
                             EnrollmentRepository enrollmentRepository,
                             FileStorageService fileStorageService) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.classRepository = classRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public Assignment createAssignment(AssignmentDto assignmentDto, Long teacherId,
                                       MultipartFile file) throws IOException {
        ClassEntity classEntity = classRepository.findById(assignmentDto.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (!classEntity.getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("You can only create assignments for your own classes");
        }

        Assignment assignment = new Assignment();
        assignment.setTitle(assignmentDto.getTitle());
        assignment.setDescription(assignmentDto.getDescription());
        assignment.setDueDate(assignmentDto.getDueDate());
        assignment.setMaxPoints(assignmentDto.getMaxPoints());
        assignment.setClassEntity(classEntity);

        if (file != null && !file.isEmpty()) {
            if (file.getSize() > 10 * 1024 * 1024) {
                throw new RuntimeException("File size too large. Maximum size is 10MB.");
            }

            String filePath = fileStorageService.storeFile(file, "assignments");
            assignment.setFilePath(filePath);
            assignment.setFileName(file.getOriginalFilename());
            assignment.setFileSize(file.getSize());
            assignment.setFileType(getFileExtension(file.getOriginalFilename()));
        }

        return assignmentRepository.save(assignment);
    }

    @Transactional
    public Submission submitAssignment(Long assignmentId, Long studentId,
                                       MultipartFile file, String comments) throws IOException {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        Enrollment enrollment = enrollmentRepository
                .findByStudentIdAndClassId(studentId, assignment.getClassEntity().getClass_id())
                .orElseThrow(() -> new RuntimeException("You are not enrolled in this class"));

        submissionRepository.findByAssignmentIdAndEnrollmentId(assignmentId, enrollment.getId())
                .ifPresent(s -> { throw new RuntimeException("Assignment already submitted"); });

        String filePath = null;
        String fileName = null;
        Long fileSize = null;

        if (file != null && !file.isEmpty()) {
            if (file.getSize() > 10 * 1024 * 1024) {
                throw new RuntimeException("File size too large. Maximum size is 10MB.");
            }

            filePath = fileStorageService.storeFile(file, "submissions");
            fileName = file.getOriginalFilename();
            fileSize = file.getSize();
        }

        Submission submission = new Submission(assignment, enrollment, filePath, fileName, fileSize, comments);
        submission.setStatus("SUBMITTED");

        return submissionRepository.save(submission);
    }

    public List<Assignment> getTeacherAssignments(Long teacherId) {
        return assignmentRepository.findByTeacherId(teacherId);
    }

    public List<Assignment> getStudentAssignments(Long studentId) {
        return assignmentRepository.findAssignmentsForStudent(studentId);
    }

    public List<Submission> getSubmissionsForAssignment(Long assignmentId, Long teacherId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if (!assignment.getClassEntity().getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("You can only view submissions for your own assignments");
        }

        return submissionRepository.findByAssignmentId(assignmentId);
    }

    public List<Submission> getSubmissionsForTeacher(Long teacherId) {
        return submissionRepository.findByTeacherId(teacherId);
    }

    @Transactional
    public Submission gradeSubmission(Long submissionId, Integer grade, String feedback, Long teacherId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (!submission.getAssignment().getClassEntity().getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("You can only grade submissions for your own assignments");
        }

        submission.setGrade(grade);
        submission.setFeedback(feedback);
        submission.setStatus("GRADED");
        submission.setGradedAt(LocalDateTime.now());

        return submissionRepository.save(submission);
    }

    public List<Submission> getStudentSubmissions(Long studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    public Assignment getAssignmentById(Long assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
    }

    public Submission getSubmissionById(Long submissionId, Long teacherId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (!submission.getAssignment().getClassEntity().getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("You can only access submissions for your own assignments");
        }

        return submission;
    }

    public byte[] downloadAssignmentFile(Long assignmentId, Long studentId) throws IOException {
        Assignment assignment = getAssignmentById(assignmentId);

        boolean isEnrolled = enrollmentRepository
                .findByStudentIdAndClassId(studentId, assignment.getClassEntity().getClass_id())
                .isPresent();

        if (!isEnrolled) {
            throw new RuntimeException("You are not enrolled in this class");
        }

        if (!assignment.hasFile()) {
            throw new RuntimeException("No file attached to this assignment");
        }

        return fileStorageService.loadFile(assignment.getFilePath());
    }

    public byte[] downloadSubmissionFile(Long submissionId, Long teacherId) throws IOException {
        Submission submission = getSubmissionById(submissionId, teacherId);

        if (!submission.hasFile()) {
            throw new RuntimeException("No file attached to this submission");
        }

        return fileStorageService.loadFile(submission.getFilePath());
    }

    public MediaType getMediaTypeForFile(String fileName) {
        String extension = getFileExtension(fileName);
        return switch (extension != null ? extension.toLowerCase() : "") {
            case "pdf" -> MediaType.APPLICATION_PDF;
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "png" -> MediaType.IMAGE_PNG;
            case "txt" -> MediaType.TEXT_PLAIN;
            case "doc" -> MediaType.parseMediaType("application/msword");
            case "docx" -> MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }

    public AssignmentDto convertToAssignmentDto(Assignment assignment) {
        AssignmentDto dto = new AssignmentDto();
        dto.setId(assignment.getId());
        dto.setTitle(assignment.getTitle());
        dto.setDescription(assignment.getDescription());
        dto.setDueDate(assignment.getDueDate());
        dto.setMaxPoints(assignment.getMaxPoints());
        dto.setClassId(assignment.getClassEntity().getClass_id());
        dto.setFileName(assignment.getFileName());
        dto.setFileSize(assignment.getFileSize());
        dto.setFileType(assignment.getFileType());
        dto.setHasFile(assignment.hasFile());
        dto.setFileExtension(assignment.getFileExtension());
        dto.setIsPreviewable(assignment.isPreviewable());
        return dto;
    }

    // FIXED THIS METHOD - Added assignmentTitle
    public SubmissionDto convertToSubmissionDto(Submission submission) {
        SubmissionDto dto = new SubmissionDto();
        dto.setId(submission.getId());
        dto.setAssignmentId(submission.getAssignmentId());
        dto.setEnrollmentId(submission.getEnrollmentId());
        dto.setFilePath(submission.getFilePath());
        dto.setFileName(submission.getFileName());
        dto.setFileSize(submission.getFileSize());
        dto.setComments(submission.getComments());
        dto.setSubmittedAt(submission.getSubmittedAt());
        dto.setGradedAt(submission.getGradedAt());
        dto.setStatus(submission.getStatus());
        dto.setGrade(submission.getGrade());
        dto.setFeedback(submission.getFeedback());
        dto.setStudentName(submission.getStudentName());
        dto.setStudentNumber(submission.getStudentNumber());
        dto.setHasFile(submission.hasFile());
        dto.setFileExtension(submission.getFileExtension());
        dto.setIsPreviewable(submission.isPreviewable());
        dto.setAssignmentTitle(submission.getAssignmentTitle()); // ADDED THIS LINE
        return dto;
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) return null;
        int lastDotIndex = fileName.lastIndexOf(".");
        return lastDotIndex > 0 ? fileName.substring(lastDotIndex + 1).toLowerCase() : null;
    }
}