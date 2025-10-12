package com.example.Edu_Camp.dto;

public class MaterialDTO {
    private Long id;
    private String title;
    private String description;
    private String subject;
    private String className;
    private String fileName;
    private String fileData; // Base64 string

    // Getters & setters
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

    public String getFileData() { return fileData; }
    public void setFileData(String fileData) { this.fileData = fileData; }
}
