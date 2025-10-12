package com.example.Edu_Camp.models;

import jakarta.persistence.*;

@Entity
@Table(name = "material")
public class TeacherMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String subject;
    private String className;
    private String fileName;

    @Lob
    @Column(columnDefinition = "MEDIUMBLOB")
    private byte[] fileData;

    public TeacherMaterial() {}

    public TeacherMaterial(String title, String description, String subject, String className, String fileName, byte[] fileData) {
        this.title = title;
        this.description = description;
        this.subject = subject;
        this.className = className;
        this.fileName = fileName;
        this.fileData = fileData;
    }

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public byte[] getFileData() { return fileData; }
    public void setFileData(byte[] fileData) { this.fileData = fileData; }
}
