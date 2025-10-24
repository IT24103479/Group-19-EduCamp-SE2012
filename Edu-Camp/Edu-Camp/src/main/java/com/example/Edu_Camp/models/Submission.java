package com.example.Edu_Camp.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    @JsonIgnore
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    @JsonIgnore
    private Enrollment enrollment;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;

    @Column(nullable = false)
    private String status = "SUBMITTED";

    private Integer grade;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    public Submission() {
        this.submittedAt = LocalDateTime.now();
    }

    public Submission(Assignment assignment, Enrollment enrollment, String filePath, String fileName, Long fileSize, String comments) {
        this();
        this.assignment = assignment;
        this.enrollment = enrollment;
        this.filePath = filePath;
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.comments = comments;
        if (isLate()) {
            this.status = "LATE";
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Assignment getAssignment() { return assignment; }
    public void setAssignment(Assignment assignment) { this.assignment = assignment; }

    public Enrollment getEnrollment() { return enrollment; }
    public void setEnrollment(Enrollment enrollment) { this.enrollment = enrollment; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getGrade() { return grade; }
    public void setGrade(Integer grade) { this.grade = grade; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    // Helper methods
    public boolean hasFile() {
        return filePath != null && !filePath.trim().isEmpty();
    }

    public String getFileExtension() {
        if (fileName == null) return null;
        int lastDotIndex = fileName.lastIndexOf(".");
        return lastDotIndex > 0 ? fileName.substring(lastDotIndex + 1).toLowerCase() : null;
    }

    public boolean isPreviewable() {
        String extension = getFileExtension();
        return hasFile() && (
                "pdf".equals(extension) ||
                        "txt".equals(extension) ||
                        "jpg".equals(extension) || "jpeg".equals(extension) ||
                        "png".equals(extension) ||
                        "doc".equals(extension) || "docx".equals(extension)
        );
    }

    public Long getAssignmentId() {
        return assignment != null ? assignment.getId() : null;
    }

    public Long getEnrollmentId() {
        return enrollment != null ? enrollment.getId() : null;
    }

    public String getStudentName() {
        return enrollment != null && enrollment.getStudent() != null
                ? enrollment.getStudent().getFirstName() + " " + enrollment.getStudent().getLastName()
                : null;
    }

    public String getStudentNumber() {
        return enrollment != null && enrollment.getStudent() != null
                ? enrollment.getStudent().getStudentNumber()
                : null;
    }

    // ADD THIS METHOD
    public String getAssignmentTitle() {
        return assignment != null ? assignment.getTitle() : null;
    }

    public boolean isGraded() {
        return "GRADED".equals(status);
    }

    public boolean isLate() {
        return assignment != null
                && assignment.getDueDate() != null
                && submittedAt != null
                && submittedAt.isAfter(assignment.getDueDate());
    }

    @PrePersist
    public void prePersist() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
        if (isLate() && !"GRADED".equals(status)) {
            status = "LATE";
        }
    }

    @PreUpdate
    public void preUpdate() {
        if (grade != null && gradedAt == null) {
            gradedAt = LocalDateTime.now();
        }
        if (isLate() && !"GRADED".equals(status)) {
            status = "LATE";
        }
    }
}