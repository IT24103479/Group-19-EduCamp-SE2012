package com.example.Edu_Camp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class AssignmentDto {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;

    @NotNull(message = "Max points is required")
    private Integer maxPoints;

    @NotNull(message = "Class ID is required")
    private Long classId;

    private String fileName;
    private Long fileSize;
    private String fileType;
    private Boolean hasFile;
    private String fileExtension;
    private Boolean isPreviewable;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public Integer getMaxPoints() { return maxPoints; }
    public void setMaxPoints(Integer maxPoints) { this.maxPoints = maxPoints; }

    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Boolean getHasFile() { return hasFile; }
    public void setHasFile(Boolean hasFile) { this.hasFile = hasFile; }

    public String getFileExtension() { return fileExtension; }
    public void setFileExtension(String fileExtension) { this.fileExtension = fileExtension; }

    public Boolean getIsPreviewable() { return isPreviewable; }
    public void setIsPreviewable(Boolean isPreviewable) { this.isPreviewable = isPreviewable; }
}