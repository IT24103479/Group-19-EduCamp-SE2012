package com.example.Edu_Camp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    public String storeFile(MultipartFile file, String subDirectory) throws IOException {
        Path uploadPath = Paths.get(uploadDir, subDirectory).toAbsolutePath().normalize();

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + fileExtension;
        Path targetLocation = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return subDirectory + "/" + fileName;
    }

    public byte[] loadFile(String filePath) throws IOException {
        if (filePath == null || filePath.trim().isEmpty()) {
            throw new IOException("File path is empty");
        }

        Path fullPath = Paths.get(uploadDir).resolve(filePath).toAbsolutePath().normalize();
        Path uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();

        if (!fullPath.startsWith(uploadRoot)) {
            throw new SecurityException("Cannot access files outside upload directory");
        }

        if (!Files.exists(fullPath)) {
            throw new IOException("File not found: " + filePath);
        }

        return Files.readAllBytes(fullPath);
    }

    public boolean fileExists(String filePath) {
        if (filePath == null || filePath.trim().isEmpty()) {
            return false;
        }
        try {
            Path fullPath = Paths.get(uploadDir).resolve(filePath).toAbsolutePath().normalize();
            Path uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();

            return fullPath.startsWith(uploadRoot) &&
                    Files.exists(fullPath) &&
                    Files.isReadable(fullPath);
        } catch (Exception e) {
            return false;
        }
    }
}
