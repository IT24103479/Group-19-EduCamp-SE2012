package com.example.Edu_Camp.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "teacher_materials")
public class TeacherMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Lob
    @Column(name = "file_data", nullable = false)
    private byte[] fileData;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    public TeacherMaterial() {}

    public TeacherMaterial(String fileName, byte[] fileData, String contentType) {
        this.fileName = fileName;
        this.fileData = fileData;
        this.contentType = contentType;
        this.uploadedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public byte[] getFileData() { return fileData; }
    public void setFileData(byte[] fileData) { this.fileData = fileData; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}

